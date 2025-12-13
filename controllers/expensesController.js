const db = require("../config/db");
const createError = require("../utils/createError");
const { createVerificationRequest } = require("../utils/verification");
const billplzService = require("../services/billplzService");
const whatsappService = require("../services/whatsappService");
const notificationController = require("../controllers/notificationController");

exports.getExpenses = async (req, res, next) => {
  try {
    const { status, supplier, search } = req.query;

    const where = [];
    const params = [];

    if (status) {
      where.push("e.status = ?");
      params.push(status);
    }

    if (supplier) {
      where.push("s.name LIKE ?");
      params.push(`%${supplier}%`);
    }

    if (search) {
      where.push("(e.invoice_no LIKE ? OR s.name LIKE ?)");
      params.push(`%${search}%`, `%${search}%`);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const [rows] = await db.query(
      `
      SELECT
        e.id,
        s.name AS supplier_name,
        e.invoice_no,
        e.total_amount,
        e.order_date,
        e.status,
        e.has_mismatch
      FROM expenses e
      LEFT JOIN suppliers s ON s.id = e.supplier_id
      ${whereSql}
      ORDER BY e.created_at DESC
      `,
      params
    );

    const data = rows.map((r, idx) => ({
      no: idx + 1,
      id: r.id,
      supplierName: r.supplier_name,
      invoiceNo: r.invoice_no,
      totalAmount: Number(r.total_amount || 0),
      orderDate: r.order_date,
      status: r.status,
      hasMismatch: !!r.has_mismatch,
    }));

    res.json(data);
  } catch (err) {
    next(err);
  }
};

exports.getMismatchDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[expense]] = await db.query(
      `
      SELECT e.id, e.invoice_no, s.name AS supplier_name
      FROM expenses e
      LEFT JOIN suppliers s ON s.id = e.supplier_id
      WHERE e.id = ?
      `,
      [id]
    );

    if (!expense) {
      throw createError(404, "Expense not found");
    }

    const [items] = await db.query(
      `
    SELECT
      ei.id,
      si.name AS item_name,
      si.oum,
      ei.qty AS qty_invoice,
      ei.qty AS qty_received,
      ei.price AS unit_price,
      (ei.qty * ei.price) AS total_amount
      FROM expense_items ei
      JOIN supplier_items si ON si.id = ei.supplier_item_id
      WHERE ei.expense_id = ?
      ORDER BY ei.id ASC
      `,
      [id]
    );

    const detail = items.map((row) => {
      const qtyInvoice = Number(row.qty_invoice || 0);
      const qtyReceived = Number(row.qty_received || 0);
      const pending = qtyInvoice - qtyReceived;

      return {
        id: row.id,
        itemName: row.item_name,
        oum: row.oum,
        qtyInvoice,
        qtyReceived,
        qtyPending: pending < 0 ? 0 : pending,
      };
    });

    res.json({
      expenseId: expense.id,
      supplierName: expense.supplier_name,
      invoiceNo: expense.invoice_no,
      items: detail,
    });
  } catch (err) {
    next(err);
  }
};

async function calculateExpectedAmount(expenseId) {
  const [rows] = await db.query(
    `
    SELECT
      COALESCE(SUM(ei.qty_received * ei.unit_price), 0) AS expected_amount
    FROM expense_items ei
    WHERE ei.expense_id = ?
    `,
    [expenseId]
  );

  return Number(rows[0].expected_amount || 0);
}

exports.updateAmount = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newAmount } = req.body;

    if (!newAmount || Number(newAmount) <= 0) {
      throw createError(400, "Nominal baru tidak valid");
    }

    const [[expense]] = await db.query(
      `
      SELECT id, total_amount, status
      FROM expenses
      WHERE id = ?
      `,
      [id]
    );

    if (!expense) {
      throw createError(404, "Expense not found");
    }

    if (expense.status === "paid") {
      throw createError(400, "Invoice sudah dibayar");
    }

    const oldAmount = Number(expense.total_amount || 0);
    const expectedAmount = await calculateExpectedAmount(id);
    const newAmt = Number(newAmount);

    if (newAmt <= expectedAmount) {
      await db.query(
        `
        UPDATE expenses
        SET total_amount = ?, has_mismatch = 0, updated_at = NOW()
        WHERE id = ?
        `,
        [newAmt, id]
      );

      res.json({
        mode: "normal",
        message: "Nominal telah dikemas kini tanpa verifikasi",
        oldAmount,
        newAmount: newAmt,
        expectedAmount,
      });

      return;
    }

    const payload = {
      expense_id: id,
      old_amount: oldAmount,
      new_amount: newAmt,
      expected_amount: expectedAmount,
    };

    const verificationId = await createVerificationRequest({
      module: "expenses",
      action: "edit_abnormal",
      requester_id: req.user.id,
      payload,
    });

    await db.query(
      `
      UPDATE expenses
      SET has_mismatch = 1, updated_at = NOW()
      WHERE id = ?
      `,
      [id]
    );

    if (notificationController.createNotification) {
      await notificationController.createNotification({
        title: "Permintaan verifikasi nominal expenses",
        message:
          "Terdapat perubahan nominal tidak normal untuk invoice expenses",
        module: "expenses",
        role: "master_admin",
      });
    }

    res.json({
      mode: "verification",
      message: "Menunggu Persetujuan Master Admin",
      verificationId,
      oldAmount,
      newAmount: newAmt,
      expectedAmount,
    });
  } catch (err) {
    next(err);
  }
};

exports.payExpenses = async (req, res, next) => {
  const connection = await db.getConnection().catch(() => null);

  try {
    const { expenseIds } = req.body;

    if (!Array.isArray(expenseIds) || expenseIds.length === 0) {
      throw createError(400, "expenseIds diperlukan");
    }

    const ids = expenseIds.map((id) => Number(id)).filter((id) => !!id);

    if (!ids.length) {
      throw createError(400, "expenseIds tidak valid");
    }

    await connection.beginTransaction();

    const [rows] = await connection.query(
      `
      SELECT
        e.id,
        e.total_amount,
        e.status,
        e.invoice_no,
        s.id AS supplier_id,
        s.name AS supplier_name,
        s.bank_name,
        s.bank_account,
        s.phone AS supplier_phone
      FROM expenses e
      LEFT JOIN suppliers s ON s.id = e.supplier_id
      WHERE e.id IN (${ids.map(() => "?").join(",")})
      FOR UPDATE
      `,
      ids
    );

    const results = [];

    for (const row of rows) {
      if (row.status === "paid") {
        results.push({
          id: row.id,
          status: "skipped",
          reason: "already_paid",
        });
        continue;
      }

      if (!row.bank_name || !row.bank_account) {
        results.push({
          id: row.id,
          status: "failed",
          reason: "missing_bank_info",
        });
        continue;
      }

      const amount = Number(row.total_amount || 0);

      const payout = await billplzService.payToSupplier({
        bankName: row.bank_name,
        accountNumber: row.bank_account,
        amount,
        reference: `EXP-${row.id}`,
        description: `Payment invoice ${row.invoice_no} supplier ${row.supplier_name}`,
      });

      if (!payout.success) {
        results.push({
          id: row.id,
          status: "failed",
          reason: payout.error || "billplz_error",
        });
        continue;
      }

      await connection.query(
        `
        UPDATE expenses
        SET status = 'paid',
            paid_at = NOW(),
            updated_at = NOW()
        WHERE id = ?
        `,
        [row.id]
      );

      if (row.supplier_phone) {
        await whatsappService.sendSupplierPaymentNotification({
          phone: row.supplier_phone,
          supplierName: row.supplier_name,
          invoiceNo: row.invoice_no,
          amount,
          reference: payout.reference,
        });
      }

      if (notificationController.createNotification) {
        await notificationController.createNotification({
          title: "Pembayaran supplier berjaya",
          message: `Pembayaran invoice ${row.invoice_no} kepada ${row.supplier_name} telah berjaya`,
          module: "expenses",
          role: "admin_hq",
        });
      }

      results.push({
        id: row.id,
        status: "paid",
        reference: payout.reference,
      });
    }

    await connection.commit();

    res.json({
      message: "Pemprosesan pembayaran selesai",
      results,
    });
  } catch (err) {
    if (connection) {
      await connection.rollback().catch(() => {});
    }
    next(err);
  } finally {
    if (connection) {
      connection.release();
    }
  }
};
