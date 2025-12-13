const db = require("../config/db");
const roles = require("../utils/roles");
const createError = require("../utils/createError");

// -----------------------------------------------------------
// GET ALL USERS (SEARCH + FILTER)
// -----------------------------------------------------------
exports.getUsers = async (req, res, next) => {
  try {
    const { search } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        u.id, u.name, u.email, u.whatsapp, u.role,
        u.outlet_id, o.name AS outlet_name,
        u.status, u.salary_daily, u.bank_name, u.bank_account
      FROM users u
      LEFT JOIN outlets o ON o.id = u.outlet_id
      WHERE 
        (? IS NULL OR
          u.name LIKE CONCAT('%', ?, '%') OR
          u.email LIKE CONCAT('%', ?, '%') OR
          u.role LIKE CONCAT('%', ?, '%') OR
          u.whatsapp LIKE CONCAT('%', ?, '%')
        )
      ORDER BY u.id DESC
      `,
      [search || null, search, search, search, search]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// GET SINGLE USER
// -----------------------------------------------------------
exports.getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[user]] = await db.query(
      `
      SELECT 
        u.*, o.name AS outlet_name
      FROM users u
      LEFT JOIN outlets o ON o.id = u.outlet_id
      WHERE u.id = ?
      `,
      [id]
    );

    res.json(user);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// ADD USER  (Admin HQ → perlu verifikasi Master Admin)
// -----------------------------------------------------------
exports.addUser = async (req, res, next) => {
  try {
    const admin = req.user;
    const data = req.body;

    if (!roles.canManageUser(admin.role))
      return next(createError(403, "Akses ditolak"));

    if (admin.role === "admin_hq") {
      const [r] = await db.query(
        `INSERT INTO verification_requests (type, payload, requested_by)
         VALUES ('add_user', ?, ?)`,
        [JSON.stringify(data), admin.id]
      );

      return res.json({
        message: "Menunggu persetujuan Master Admin",
        request_id: r.insertId,
      });
    }

    await db.query(
      `
      INSERT INTO users 
      (name, email, whatsapp, role, outlet_id, salary_daily, bank_name, bank_account, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
      `,
      [
        data.name,
        data.email,
        data.whatsapp,
        data.role,
        data.outlet_id,
        data.salary_daily,
        data.bank_name,
        data.bank_account,
      ]
    );

    res.json({ message: "User berjaya ditambah" });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// UPDATE USER (Admin HQ → verifikasi)
// -----------------------------------------------------------
exports.updateUser = async (req, res, next) => {
  try {
    const admin = req.user;
    const { id } = req.params;
    const data = req.body;

    if (!roles.canManageUser(admin.role))
      return next(createError(403, "Akses ditolak"));

    if (admin.role === "admin_hq") {
      const [r] = await db.query(
        `INSERT INTO verification_requests (type, target_id, payload, requested_by)
         VALUES ('edit_user', ?, ?, ?)`,
        [id, JSON.stringify(data), admin.id]
      );

      return res.json({
        message: "Menunggu persetujuan Master Admin",
        request_id: r.insertId,
      });
    }

    await db.query(
      `
      UPDATE users SET
        name = ?, email = ?, whatsapp = ?, role = ?, outlet_id = ?,
        salary_daily = ?, bank_name = ?, bank_account = ?
      WHERE id = ?
      `,
      [
        data.name,
        data.email,
        data.whatsapp,
        data.role,
        data.outlet_id,
        data.salary_daily,
        data.bank_name,
        data.bank_account,
        id,
      ]
    );

    res.json({ message: "User berjaya dikemaskini" });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// SUSPEND USER
// -----------------------------------------------------------
exports.suspendUser = async (req, res, next) => {
  try {
    const admin = req.user;
    const { id } = req.params;

    if (!roles.canManageUser(admin.role))
      return next(createError(403, "Akses ditolak"));

    await db.query(`UPDATE users SET status = 'suspended' WHERE id = ?`, [id]);

    res.json({ message: "User telah digantung (suspended)" });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// ACTIVATE USER
// -----------------------------------------------------------
exports.activateUser = async (req, res, next) => {
  try {
    const admin = req.user;
    const { id } = req.params;

    if (!roles.canManageUser(admin.role))
      return next(createError(403, "Akses ditolak"));

    await db.query(`UPDATE users SET status = 'active' WHERE id = ?`, [id]);

    res.json({ message: "User aktif semula" });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// DELETE USER (Master Admin sahaja)
// -----------------------------------------------------------
exports.deleteUser = async (req, res, next) => {
  try {
    const admin = req.user;
    const { id } = req.params;

    if (admin.role !== "master_admin")
      return next(createError(403, "Hanya Master Admin boleh delete user"));

    await db.query(`DELETE FROM users WHERE id = ?`, [id]);

    res.json({ message: "User berjaya dihapuskan" });
  } catch (err) {
    next(err);
  }
};
