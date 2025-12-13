const db = require("../config/db");

// ---------------------------------------------
// HQ: GET SEMUA STOK
// ---------------------------------------------
exports.getAllStock = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        id,
        name AS item_name,
        unit,
        standard_level AS min_level,
        actual_stock AS on_hand,
        CASE 
          WHEN on_hand = 0 THEN 'habis'
          WHEN on_hand <= min_level THEN 'menipis'
          ELSE 'aman'
        END AS status
      FROM stock_items
      ORDER BY item_name ASC
      `
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// HQ: UPDATE MINIMUM LEVEL (MASTER ADMIN & ADMIN HQ)
// ---------------------------------------------
exports.updateMinLevel = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { min_level } = req.body;

    await db.query(`UPDATE stock_items SET min_level = ? WHERE id = ?`, [
      min_level,
      id,
    ]);

    res.json({ message: "Minimum level berjaya dikemaskini" });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// CK: STOCK IN (TAMBAH STOK BARANG)
// ---------------------------------------------
exports.stockIn = async (req, res, next) => {
  try {
    const user = req.user;

    if (user.role !== "central_kitchen") {
      return res
        .status(403)
        .json({ message: "Akses khas Central Kitchen sahaja" });
    }

    const { item_id, qty } = req.body;

    await db.query(
      `INSERT INTO stocks (item_id, qty, type, created_by) VALUES (?, ?, 'in', ?)`,
      [item_id, qty, user.id]
    );

    await db.query(
      `UPDATE stock_items SET on_hand = on_hand + ? WHERE id = ?`,
      [qty, item_id]
    );

    res.json({ message: "Stok berjaya ditambah" });
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------
// CK: LIST HISTORY STOCK IN
// ---------------------------------------------
exports.getStockHistory = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT 
        s.id,
        si.name AS item_name
        s.qty,
        s.type,
        s.created_by,
        s.created_at
      FROM stocks s
      JOIN stock_items si ON si.id = s.item_id
      ORDER BY s.id DESC
      `
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};
