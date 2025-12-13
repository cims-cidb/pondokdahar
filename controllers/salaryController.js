const db = require("../config/db");
const createError = require("../utils/createError");

exports.getSalaryList = async (req, res, next) => {
  try {
    const { outletId, status, month, year } = req.query;

    let sql = `
      SELECT
        s.id,
        s.user_id,
        u.name AS staff_name,
        s.outlet_id,
        o.name AS outlet_name,
        s.month,
        s.year,
        s.total_days,
        s.base_salary,
        s.total_deduction,
        s.total_salary,
        s.status,
        s.paid_at,
        s.created_at
      FROM salary s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN outlets o ON o.id = s.outlet_id
      WHERE 1 = 1
    `;
    const params = [];

    if (outletId) {
      sql += " AND s.outlet_id = ?";
      params.push(outletId);
    }

    if (status) {
      sql += " AND s.status = ?";
      params.push(status);
    }

    if (month) {
      sql += " AND s.month = ?";
      params.push(month);
    }

    if (year) {
      sql += " AND s.year = ?";
      params.push(year);
    }

    sql += " ORDER BY s.year DESC, s.month DESC, s.id DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getSalaryDetail = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT
        s.id,
        s.user_id,
        u.name AS staff_name,
        s.outlet_id,
        o.name AS outlet_name,
        s.month,
        s.year,
        s.total_days,
        s.base_salary,
        s.total_deduction,
        s.total_salary,
        s.status,
        s.paid_at,
        s.created_at
      FROM salary s
      JOIN users u ON u.id = s.user_id
      LEFT JOIN outlets o ON o.id = s.outlet_id
      WHERE s.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      throw createError(404, "Salary record not found");
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.updateSalary = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { totalSalary, totalDeduction, baseSalary, totalDays } = req.body;

    const [rows] = await db.query(`SELECT * FROM salary WHERE id = ?`, [id]);
    if (!rows.length) {
      throw createError(404, "Salary record not found");
    }

    const current = rows[0];

    const newBase = baseSalary != null ? baseSalary : current.base_salary;
    const newDays = totalDays != null ? totalDays : current.total_days;
    const newDeduction =
      totalDeduction != null ? totalDeduction : current.total_deduction;
    const newTotal = totalSalary != null ? totalSalary : current.total_salary;

    await db.query(
      `
      UPDATE salary
      SET base_salary = ?, total_days = ?, total_deduction = ?, total_salary = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [newBase, newDays, newDeduction, newTotal, id]
    );

    res.json({ message: "Salary updated" });
  } catch (err) {
    next(err);
  }
};

exports.paySalary = async (req, res, next) => {
  try {
    const { salaryIds } = req.body;

    if (!Array.isArray(salaryIds) || !salaryIds.length) {
      throw createError(400, "salaryIds must be a non-empty array");
    }

    const [rows] = await db.query(
      `
      SELECT id
      FROM salary
      WHERE id IN ( ${salaryIds.map(() => "?").join(",")} )
      AND status = 'unpaid'
      `,
      salaryIds
    );

    if (!rows.length) {
      return res.json({ message: "No unpaid salary to process" });
    }

    const idsToPay = rows.map((r) => r.id);

    await db.query(
      `
      UPDATE salary
      SET status = 'paid', paid_at = NOW(), updated_at = NOW()
      WHERE id IN ( ${idsToPay.map(() => "?").join(",")} )
      `,
      idsToPay
    );

    res.json({
      message: "Salary marked as paid",
      paidIds: idsToPay,
    });
  } catch (err) {
    next(err);
  }
};
