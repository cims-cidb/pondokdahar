const db = require("../config/db");
const VerificationRequest = require("../models/VerificationRequest");
const sendEmail = require("../utils/sendEmail");
const sendWhatsApp = require("../utils/sendWhatsApp");

exports.getAllSuppliers = async (req, res, next) => {
  try {
    const [suppliers] = await db.query(
      `SELECT id, name, phone, bank_name, bank_account, address, outlet_target 
       FROM suppliers 
       WHERE deleted_at IS NULL 
       ORDER BY id DESC`
    );
    res.json(suppliers);
  } catch (err) {
    next(err);
  }
};

exports.getSupplierById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const [row] = await db.query(
      `SELECT id, name, phone, bank_name, bank_account, address, outlet_target 
       FROM suppliers 
       WHERE id = ?`,
      [id]
    );
    if (row.length === 0)
      return res.status(404).json({ message: "Supplier not found" });
    res.json(row[0]);
  } catch (err) {
    next(err);
  }
};

exports.getSupplierItems = async (req, res, next) => {
  try {
    const { supplierId } = req.params;
    const [items] = await db.query(
      `SELECT id, name AS item_name, oum AS unit, price 
       FROM supplier_items 
       WHERE supplier_id = ? 
       ORDER BY id DESC`,
      [supplierId]
    );
    res.json(items);
  } catch (err) {
    next(err);
  }
};

exports.createSupplier = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { name, phone, bank_name, bank_account, address, outlet_target } =
      req.body;

    const [result] = await db.query(
      `INSERT INTO verification_requests 
       (module, action, requester_id, payload, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [
        "supplier",
        "create",
        requesterId,
        JSON.stringify({
          name,
          phone,
          bank_name,
          bank_account,
          address,
          outlet_target,
        }),
      ]
    );

    res.json({
      message: "Menunggu Persetujuan Master Admin",
      verificationId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSupplier = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { id } = req.params;
    const { name, phone, bank_name, bank_account, address, outlet_target } =
      req.body;

    const [result] = await db.query(
      `INSERT INTO verification_requests 
       (module, action, requester_id, payload, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [
        "supplier",
        "update",
        requesterId,
        JSON.stringify({
          id,
          name,
          phone,
          bank_name,
          bank_account,
          address,
          outlet_target,
        }),
      ]
    );

    res.json({
      message: "Menunggu Persetujuan Master Admin",
      verificationId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSupplier = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { id } = req.params;

    const [result] = await db.query(
      `INSERT INTO verification_requests 
       (module, action, requester_id, payload, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      ["supplier", "delete", requesterId, JSON.stringify({ id })]
    );

    res.json({
      message: "Menunggu Persetujuan Master Admin",
      verificationId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

exports.addSupplierItem = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { supplierId } = req.params;
    const { item_name, unit, price } = req.body;

    const [result] = await db.query(
      `INSERT INTO verification_requests 
       (module, action, requester_id, payload, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [
        "supplier_item",
        "create",
        requesterId,
        JSON.stringify({ supplierId, item_name, unit, price }),
      ]
    );

    res.json({
      message: "Menunggu Persetujuan Master Admin",
      verificationId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateSupplierItem = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { itemId } = req.params;
    const { item_name, unit, price } = req.body;

    const [result] = await db.query(
      `INSERT INTO verification_requests 
       (module, action, requester_id, payload, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [
        "supplier_item",
        "update",
        requesterId,
        JSON.stringify({ itemId, item_name, unit, price }),
      ]
    );

    res.json({
      message: "Menunggu Persetujuan Master Admin",
      verificationId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteSupplierItem = async (req, res, next) => {
  try {
    const requesterId = req.user.id;
    const { itemId } = req.params;

    const [result] = await db.query(
      `INSERT INTO verification_requests 
       (module, action, requester_id, payload, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      ["supplier_item", "delete", requesterId, JSON.stringify({ itemId })]
    );

    res.json({
      message: "Menunggu Persetujuan Master Admin",
      verificationId: result.insertId,
    });
  } catch (err) {
    next(err);
  }
};
