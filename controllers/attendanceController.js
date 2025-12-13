const db = require("../config/db");

exports.getAttendance = async (req, res, next) => {
  try {
    const { outletId, date, search } = req.query;

    let sql = `
      SELECT 
        a.id,
        u.name AS staff_name,
        o.name AS outlet_name,
        a.clock_in AS clock_in,
        DATE(a.clock_in) AS date
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      JOIN outlets o ON o.id = a.outlet_id
      WHERE 1=1
    `;
    const params = [];

    if (outletId) {
      sql += " AND a.outlet_id = ? ";
      params.push(outletId);
    }

    if (date) {
      sql += " AND DATE(a.clock_in) = ? ";
      params.push(date);
    }

    if (search) {
      sql += " AND u.name LIKE ? ";
      params.push(`%${search}%`);
    }

    sql += " ORDER BY a.clock_in DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getAttendanceByOutlet = async (req, res, next) => {
  try {
    const { outletId } = req.params;
    const { date, search } = req.query;

    let sql = `
      SELECT 
        a.id,
        u.name AS staff_name,
        o.name AS outlet_name,
        a.clock_in AS clock_in,
        DATE(a.clock_in) AS date
      FROM attendance a
      JOIN users u ON u.id = a.user_id
      JOIN outlets o ON o.id = a.outlet_id
      WHERE a.outlet_id = ?
    `;
    const params = [outletId];

    if (date) {
      sql += " AND DATE(a.clock_in) = ? ";
      params.push(date);
    }

    if (search) {
      sql += " AND u.name LIKE ? ";
      params.push(`%${search}%`);
    }

    sql += " ORDER BY a.clock_in DESC";

    const [rows] = await db.query(sql, params);
    res.json(rows);
  } catch (err) {
    next(err);
  }
};
