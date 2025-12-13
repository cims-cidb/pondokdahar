const db = require("../config/db");
const createError = require("../utils/createError");

exports.getConsumption = async (req, res, next) => {
  try {
    const { outletId, date, search } = req.query;

    const params = [];
    let where = "1=1";

    if (outletId) {
      where += " AND c.outlet_id = ?";
      params.push(outletId);
    }

    if (date) {
      where += " AND DATE(c.consumption_date) = ?";
      params.push(date);
    }

    if (search) {
      where += " AND u.name LIKE ?";
      params.push(`%${search}%`);
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id AS staff_id,
        u.name AS staff_name,
        o.id AS outlet_id,
        o.name AS outlet_name,
        COUNT(c.id) AS total_consumption,
        DATE(c.consumption_date) AS consumption_date
      FROM consumption c
      JOIN users u ON u.id = c.user_id
      JOIN outlets o ON o.id = c.outlet_id
      WHERE ${where}
      GROUP BY u.id, o.id, DATE(c.consumption_date)
      ORDER BY u.name ASC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getConsumptionByOutlet = async (req, res, next) => {
  try {
    const { outletId } = req.params;
    const { date, search } = req.query;

    const params = [outletId];
    let where = "c.outlet_id = ?";

    if (date) {
      where += " AND DATE(c.consumption_date) = ?";
      params.push(date);
    }

    if (search) {
      where += " AND u.name LIKE ?";
      params.push(`%${search}%`);
    }

    const [rows] = await db.query(
      `
      SELECT 
        u.id AS staff_id,
        u.name AS staff_name,
        o.id AS outlet_id,
        o.name AS outlet_name,
        COUNT(c.id) AS total_consumption,
        DATE(c.consumption_date) AS consumption_date
      FROM consumption c
      JOIN users u ON u.id = c.user_id
      JOIN outlets o ON o.id = c.outlet_id
      WHERE ${where}
      GROUP BY u.id, o.id, DATE(c.consumption_date)
      ORDER BY u.name ASC
      `,
      params
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.addConsumption = async (req, res, next) => {
  try {
    const { user_id, outlet_id, consumption_date, source } = req.body;

    if (!user_id || !outlet_id || !consumption_date) {
      throw createError(400, "user_id, outlet_id dan consumption_date wajib");
    }

    await db.query(
      `
      INSERT INTO consumption (user_id, outlet_id, consumption_date, source)
      VALUES (?, ?, ?, ?)
      `,
      [user_id, outlet_id, consumption_date, source || "system"]
    );

    res.json({ message: "Consumption recorded" });
  } catch (err) {
    next(err);
  }
};
