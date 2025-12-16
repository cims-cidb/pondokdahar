const db = require("../config/db");

/**
 * =========================
 * DASHBOARD SUMMARY
 * =========================
 */
exports.getSummary = async (req, res, next) => {
  try {
    const { date } = req.query;

    const [revenueRows] = await db.query(
      `
      SELECT 
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(id) AS total_orders
      FROM pos_sales
      WHERE status = 'paid'
      AND (? IS NULL OR DATE(sale_date) = ?)
      `,
      [date || null, date || null]
    );

    const revenue = Number(revenueRows[0].revenue);
    const totalOrders = Number(revenueRows[0].total_orders);

    const [expenseRows] = await db.query(
      `
      SELECT COALESCE(SUM(total_amount), 0) AS expenses
      FROM expenses
      WHERE status = 'paid'
      AND (? IS NULL OR DATE(paid_at) = ?)
      `,
      [date || null, date || null]
    );

    const expenses = Number(expenseRows[0].expenses);
    const profitValue = revenue - expenses;

    const profit =
      profitValue < 0
        ? `LOSS - RM ${Math.abs(profitValue)}`
        : `RM ${profitValue}`;

    const [[outletRow]] = await db.query(
      `SELECT COUNT(id) AS total FROM outlets WHERE deleted_at IS NULL`
    );

    const [[staffRow]] = await db.query(
      `
      SELECT COUNT(id) AS total
      FROM users
      WHERE status = 'active'
      AND role IN (
        'admin_hq',
        'manager_outlet',
        'staff_outlet',
        'driver',
        'central_kitchen'
      )
      `
    );

    const [[supplierRow]] = await db.query(
      `SELECT COUNT(id) AS total FROM suppliers WHERE deleted_at IS NULL`
    );

    res.json({
      date,
      profit,
      totalRevenue: revenue,
      totalOrders,
      totalExpenses: expenses,
      totalOutlet: outletRow.total,
      totalStaff: staffRow.total,
      totalSupplier: supplierRow.total,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * =========================
 * TOP SELLING ITEMS
 * =========================
 */
exports.getTopItems = async (req, res) => {
  try {
    const date = req.query.date || null; // format: 'YYYY-MM-DD' atau null

    const [rows] = await pool.query(
      `
      SELECT
        psi.item_name,
        SUM(psi.qty) AS total_qty
      FROM pos_sales_items psi
      JOIN pos_sales ps ON ps.id = psi.pos_sale_id
      WHERE (? IS NULL OR ps.sale_date = ?)
      GROUP BY psi.item_name
      ORDER BY total_qty DESC
      LIMIT 5
      `,
      [date, date]
    );

    res.json(rows);
  } catch (err) {
    console.error("getTopItems error:", err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};

/**
 * =========================
 * FINANCIAL FORECAST
 * =========================
 */
exports.getFinancialForecast = async (req, res, next) => {
  try {
    const [revenueRows] = await db.query(
      `
      SELECT 
        MONTH(sale_date) AS month,
        SUM(total_amount) AS total
      FROM pos_sales
      WHERE status = 'paid'
      GROUP BY MONTH(sale_date)
      ORDER BY month
      `
    );

    const [expenseRows] = await db.query(
      `
      SELECT 
        MONTH(paid_at) AS month,
        SUM(total_amount) AS total
      FROM expenses
      WHERE status = 'paid'
      GROUP BY MONTH(paid_at)
      ORDER BY month
      `
    );

    const revenue = Array(12).fill(0);
    const expenses = Array(12).fill(0);

    revenueRows.forEach((r) => {
      revenue[r.month - 1] = Number(r.total);
    });

    expenseRows.forEach((e) => {
      expenses[e.month - 1] = Number(e.total);
    });

    res.json({ revenue, expenses });
  } catch (err) {
    next(err);
  }
};
