const db = require("../config/db");
const createError = require("../utils/createError");

exports.getAllRequests = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT vr.*, u.name AS requester_name
      FROM verification_requests vr
      LEFT JOIN users u ON u.id = vr.requester_id
      WHERE vr.status = 'pending'
      ORDER BY vr.created_at DESC
      `
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT vr.*, u.name AS requester_name
      FROM verification_requests vr
      LEFT JOIN users u ON u.id = vr.requester_id
      WHERE vr.id = ?
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      throw createError(404, "Request not found");
    }

    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
};

exports.approveRequest = async (req, res, next) => {
  const connection = await db.getConnection();
  try {
    const { id } = req.params;

    const [rows] = await connection.query(
      `
      SELECT *
      FROM verification_requests
      WHERE id = ? AND status = 'pending'
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      throw createError(404, "Request not found or already processed");
    }

    const request = rows[0];
    const payload = request.payload ? JSON.parse(request.payload) : {};

    await connection.beginTransaction();

    if (request.module === "supplier" && request.action === "create") {
      await connection.query(
        `
        INSERT INTO suppliers (name, phone, address)
        VALUES (?, ?, ?)
        `,
        [payload.name, payload.phone, payload.address]
      );
    }

    if (request.module === "supplier" && request.action === "update") {
      await connection.query(
        `
        UPDATE suppliers
        SET name = ?, phone = ?, address = ?
        WHERE id = ?
        `,
        [payload.name, payload.phone, payload.address, payload.id]
      );
    }

    if (request.module === "supplier" && request.action === "delete") {
      await connection.query(
        `
        UPDATE suppliers
        SET deleted_at = NOW()
        WHERE id = ?
        `,
        [payload.id]
      );
    }

    await connection.query(
      `
      UPDATE verification_requests
      SET status = 'approved', approved_by = ?, approved_at = NOW()
      WHERE id = ?
      `,
      [req.user.id, id]
    );

    await connection.commit();

    res.json({ message: "Request approved and applied" });
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch (_) {}
    next(err);
  } finally {
    if (connection && connection.release) {
      connection.release();
    }
  }
};

exports.rejectRequest = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [rows] = await db.query(
      `
      SELECT id
      FROM verification_requests
      WHERE id = ? AND status = 'pending'
      LIMIT 1
      `,
      [id]
    );

    if (!rows.length) {
      throw createError(404, "Request not found or already processed");
    }

    await db.query(
      `
      UPDATE verification_requests
      SET status = 'rejected', approved_by = ?, approved_at = NOW()
      WHERE id = ?
      `,
      [req.user.id, id]
    );

    res.json({ message: "Request rejected" });
  } catch (err) {
    next(err);
  }
};
