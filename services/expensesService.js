const db = require("../config/db");

exports.createFromOrder = async (orderId) => {
  const [[order]] = await db.query(
    `
    SELECT id, outlet_id
    FROM orders
    WHERE id = ?
    `,
    [orderId]
  );

  if (!order) {
    return;
  }

  const [groups] = await db.query(
    `
    SELECT id, supplier_id, total_amount, invoice_no
    FROM order_supplier_groups
    WHERE order_id = ?
    `,
    [orderId]
  );

  if (!groups.length) {
    return;
  }

  const [items] = await db.query(
    `
    SELECT
      oi.id,
      oi.order_id,
      oi.supplier_id,
      oi.supplier_item_id,
      oi.qty,
      oi.price,
      oi.total_amount
    FROM order_items oi
    WHERE oi.order_id = ?
    `,
    [orderId]
  );

  for (const group of groups) {
    const supplierItems = items.filter(
      (i) => i.supplier_id === group.supplier_id
    );

    if (!supplierItems.length) {
      continue;
    }

    let totalAmount = Number(group.total_amount || 0);
    if (!totalAmount) {
      totalAmount = supplierItems.reduce(
        (sum, i) => sum + Number(i.total_amount || 0),
        0
      );
    }

    let invoiceNo = group.invoice_no;
    if (!invoiceNo) {
      invoiceNo = `INV-PD-${order.outlet_id}-${group.id}`;
      await db.query(
        `
        UPDATE order_supplier_groups
        SET invoice_no = ?, updated_at = NOW()
        WHERE id = ?
        `,
        [invoiceNo, group.id]
      );
    }

    const [expResult] = await db.query(
      `
      INSERT INTO expenses
      (supplier_id, outlet_id, invoice_no, total_amount, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, 'unpaid', NOW(), NOW())
      `,
      [group.supplier_id, order.outlet_id, invoiceNo, totalAmount]
    );

    const expenseId = expResult.insertId;

    for (const item of supplierItems) {
      await db.query(
        `
        INSERT INTO expense_items
        (expense_id, supplier_item_id, qty, price, total_amount, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `,
        [
          expenseId,
          item.supplier_item_id,
          item.qty,
          item.price,
          item.total_amount,
        ]
      );
    }
  }
};
