const db = require("../config/db");
const createError = require("../utils/createError");

// -----------------------------------------------------------
// GET LIST OUTLET (SEARCH)
// -----------------------------------------------------------
exports.getOutlets = async (req, res, next) => {
  try {
    const { search } = req.query;

    const [rows] = await db.query(
      `
      SELECT 
        id,
        name,
        address,
        created_at
      FROM outlets
      WHERE deleted_at IS NULL
      AND (
        ? IS NULL
        OR name LIKE CONCAT('%', ?, '%')
        OR address LIKE CONCAT('%', ?, '%')
      )
      ORDER BY id DESC
      `,
      [search || null, search, search]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// GET SINGLE OUTLET
// -----------------------------------------------------------
exports.getOutletById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [[outlet]] = await db.query(
      `
      SELECT 
        id,
        name,
        address,
        created_at
      FROM outlets
      WHERE id = ? AND deleted_at IS NULL
      `,
      [id]
    );

    if (!outlet) return next(createError(404, "Outlet tidak ditemukan"));

    res.json(outlet);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// ADD OUTLET (TANPA VERIFIKASI)
// -----------------------------------------------------------
exports.createOutlet = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || (user.role !== "master_admin" && user.role !== "admin_hq")) {
      return next(createError(403, "Akses ditolak"));
    }

    const { name, address } = req.body;

    if (!name) return next(createError(400, "Nama outlet wajib diisi"));

    const [result] = await db.query(
      `
      INSERT INTO outlets (name, address, created_at, updated_at)
      VALUES (?, ?, NOW(), NOW())
      `,
      [name, address || null]
    );

    res.json({
      message: "Outlet berjaya ditambah",
      id: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// UPDATE OUTLET (TANPA VERIFIKASI)
// -----------------------------------------------------------
exports.updateOutlet = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || (user.role !== "master_admin" && user.role !== "admin_hq")) {
      return next(createError(403, "Akses ditolak"));
    }

    const { id } = req.params;
    const { name, address } = req.body;

    const [[outlet]] = await db.query(
      `SELECT id FROM outlets WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!outlet) return next(createError(404, "Outlet tidak ditemukan"));

    await db.query(
      `
      UPDATE outlets
      SET name = ?, address = ?, updated_at = NOW()
      WHERE id = ?
      `,
      [name, address || null, id]
    );

    res.json({ message: "Outlet berjaya dikemaskini" });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// REQUEST DELETE OUTLET (PERLU VERIFIKASI MASTER ADMIN)
// -----------------------------------------------------------
exports.requestDeleteOutlet = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || (user.role !== "master_admin" && user.role !== "admin_hq")) {
      return next(createError(403, "Akses ditolak"));
    }

    const { id } = req.params;

    const [[outlet]] = await db.query(
      `SELECT id, name, address FROM outlets WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );

    if (!outlet) return next(createError(404, "Outlet tidak ditemukan"));

    await db.query(
      `
      INSERT INTO verification_requests (type, target_id, payload, requested_by)
      VALUES ('delete_outlet', ?, ?, ?)
      `,
      [id, JSON.stringify(outlet), user.id]
    );

    res.json({
      message:
        "Permintaan hapus outlet dihantar. Menunggu persetujuan Master Admin.",
    });
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// GET STANDARD LEVEL ITEM UNTUK OUTLET (VIEW ITEM DETAIL POPUP)
// -----------------------------------------------------------
exports.getOutletStandards = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user || (user.role !== "master_admin" && user.role !== "admin_hq")) {
      return next(createError(403, "Akses ditolak"));
    }

    const { id } = req.params;

    const [[outlet]] = await db.query(
      `SELECT id FROM outlets WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    if (!outlet) return next(createError(404, "Outlet tidak ditemukan"));

    const [items] = await db.query(
      `
      SELECT
  osi.id,
  si.name AS item_name,
  osi.oum,
  osi.standard_level
FROM outlet_item_standards osi
JOIN supplier_items si ON si.id = osi.supplier_item_id
WHERE osi.outlet_id = ?
ORDER BY si.name ASC
      `,
      [id]
    );

    res.json(items);
  } catch (err) {
    next(err);
  }
};

// -----------------------------------------------------------
// UPDATE STANDARD LEVEL ITEM (BUTANG -2/+2/-10/+10 → UPDATE)
// -----------------------------------------------------------
exports.updateOutletStandards = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const user = req.user;
    if (!user || (user.role !== "master_admin" && user.role !== "admin_hq")) {
      connection.release();
      return next(createError(403, "Akses ditolak"));
    }

    const { id } = req.params;
    const { items } = req.body;

    const [[outlet]] = await connection.query(
      `SELECT id FROM outlets WHERE id = ? AND deleted_at IS NULL`,
      [id]
    );
    if (!outlet) {
      connection.release();
      return next(createError(404, "Outlet tidak ditemukan"));
    }

    if (!Array.isArray(items) || !items.length) {
      connection.release();
      return next(createError(400, "Data item standard level tidak valid"));
    }

    await connection.beginTransaction();

    for (const item of items) {
      await connection.query(
        `
        UPDATE outlet_standard_items
        SET standard_level = ?
        WHERE id = ? AND outlet_id = ?
        `,
        [item.standard_level, item.id, id]
      );
    }

    await connection.commit();
    connection.release();

    res.json({ message: "Standard level stock outlet berjaya dikemaskini" });
  } catch (err) {
    await connection.rollback();
    connection.release();
    next(err);
  }
};
