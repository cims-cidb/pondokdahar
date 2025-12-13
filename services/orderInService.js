const db = require("../config/db");
const whatsappService = require("./whatsappService");

async function createOrder(outletId, managerId, items) {
  if (!Array.isArray(items) || items.length === 0) {
    const error = new Error("Items tidak boleh kosong");
    error.status = 400;
    throw error;
  }

  const [[outlet]] = await db.query(
    "SELECT id, name FROM outlets WHERE id = ?",
    [outletId]
  );
  if (!outlet) {
    const error = new Error("Outlet tidak ditemukan");
    error.status = 404;
    throw error;
  }

  const [[manager]] = await db.query(
    "SELECT id, name FROM users WHERE id = ?",
    [managerId]
  );
  if (!manager) {
    const error = new Error("Manager tidak ditemukan");
    error.status = 404;
    throw error;
  }

  const supplierItemIds = items.map((i) => i.supplierItemId);
  const placeholders = supplierItemIds.map(() => "?").join(",");

  const [supplierItems] = await db.query(
    `
    SELECT 
      si.id,
      si.name AS item_name,
      si.price,
      si.oum,
      si.supplier_id,
      s.name AS supplier_name,
      s.whatsapp_number
    FROM supplier_items si
    JOIN suppliers s ON s.id = si.supplier_id
    WHERE si.id IN (${placeholders})
    `,
    supplierItemIds
  );

  const mapItems = new Map();
  supplierItems.forEach((row) => {
    mapItems.set(row.id, row);
  });

  let totalQty = 0;
  let totalAmount = 0;
  const preparedItems = [];

  items.forEach((item) => {
    const base = mapItems.get(item.supplierItemId);
    if (!base) {
      return;
    }
    const qty = Number(item.qty) || 0;
    if (qty <= 0) {
      return;
    }
    const price = Number(base.price) || 0;
    const subtotal = price * qty;
    totalQty += qty;
    totalAmount += subtotal;
    preparedItems.push({
      supplier_item_id: base.id,
      supplier_id: base.supplier_id,
      qty,
      price,
      subtotal,
      oum: base.oum,
      item_name: base.item_name,
      supplier_name: base.supplier_name,
      whatsapp_number: base.whatsapp_number,
    });
  });

  if (preparedItems.length === 0) {
    const error = new Error("Tidak ada item valid untuk diorder");
    error.status = 400;
    throw error;
  }

  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `
      INSERT INTO orders (outlet_id, manager_id, status, total_qty, total_amount)
      VALUES (?, ?, ?, ?, ?)
      `,
      [outletId, managerId, "processing", totalQty, totalAmount]
    );

    const orderId = orderResult.insertId;

    const values = [];
    preparedItems.forEach((pi) => {
      values.push(
        orderId,
        pi.supplier_item_id,
        pi.supplier_id,
        pi.qty,
        pi.price,
        pi.subtotal,
        pi.oum
      );
    });

    const valuesPlaceholder = preparedItems
      .map(() => "(?, ?, ?, ?, ?, ?, ?)")
      .join(",");

    await conn.query(
      `
      INSERT INTO order_items
      (order_id, supplier_item_id, supplier_id, qty, price, subtotal, oum)
      VALUES ${valuesPlaceholder}
      `,
      values
    );

    const now = new Date();
    const title = "Order baru dari outlet";
    const message = `Order baru dari ${outlet.name} (Order ID: ${orderId})`;

    await conn.query(
      `
      INSERT INTO notifications (user_id, title, message, is_read, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?)
      `,
      [null, title, message, now, now]
    );

    await conn.commit();

    const suppliersMap = new Map();

    preparedItems.forEach((pi) => {
      if (!suppliersMap.has(pi.supplier_id)) {
        suppliersMap.set(pi.supplier_id, {
          supplierName: pi.supplier_name,
          whatsappNumber: pi.whatsapp_number,
          items: [],
        });
      }
      const entry = suppliersMap.get(pi.supplier_id);
      entry.items.push({
        name: pi.item_name,
        qty: pi.qty,
        oum: pi.oum,
      });
    });

    const suppliersPayload = Array.from(suppliersMap.values());

    await whatsappService.sendOrderToSuppliers({
      outletName: outlet.name,
      orderId,
      managerName: manager.name,
      suppliers: suppliersPayload,
    });

    return { orderId };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

async function listOrdersForUser(user, filters) {
  const params = [];
  let sql =
    "SELECT o.id, o.outlet_id, o.manager_id, o.status, o.total_qty, o.total_amount, o.created_at, ot.name AS outlet_name, u.name AS manager_name FROM orders o LEFT JOIN outlets ot ON ot.id = o.outlet_id LEFT JOIN users u ON u.id = o.manager_id WHERE 1=1";

  if (user.role === "manager_outlet") {
    sql += " AND o.outlet_id = ?";
    params.push(user.outlet_id);
  }

  if (filters.outletId) {
    sql += " AND o.outlet_id = ?";
    params.push(filters.outletId);
  }

  if (filters.status) {
    sql += " AND o.status = ?";
    params.push(filters.status);
  }

  sql += " ORDER BY o.created_at DESC";

  const [rows] = await db.query(sql, params);
  return rows;
}

async function getOrderDetail(orderId, user) {
  const [[order]] = await db.query(
    `
    SELECT 
      o.id,
      o.outlet_id,
      o.manager_id,
      o.status,
      o.total_qty,
      o.total_amount,
      o.created_at,
      ot.name AS outlet_name,
      u.name AS manager_name
    FROM orders o
    LEFT JOIN outlets ot ON ot.id = o.outlet_id
    LEFT JOIN users u ON u.id = o.manager_id
    WHERE o.id = ?
    `,
    [orderId]
  );

  if (!order) {
    const error = new Error("Order tidak ditemukan");
    error.status = 404;
    throw error;
  }

  if (user.role === "manager_outlet" && user.outlet_id !== order.outlet_id) {
    const error = new Error("Tidak diizinkan melihat order ini");
    error.status = 403;
    throw error;
  }

  const [items] = await db.query(
    `
    SELECT 
      oi.id,
      oi.qty,
      oi.price,
      oi.subtotal,
      oi.oum,
      si.name AS item_name,
      s.name AS supplier_name
    FROM order_items oi
    LEFT JOIN supplier_items si ON si.id = oi.supplier_item_id
    LEFT JOIN suppliers s ON s.id = oi.supplier_id
    WHERE oi.order_id = ?
    `,
    [orderId]
  );

  return { order, items };
}

async function driverConfirm(orderId, driverId) {
  const [[order]] = await db.query(
    "SELECT id, status, outlet_id, manager_id FROM orders WHERE id = ?",
    [orderId]
  );

  if (!order) {
    const error = new Error("Order tidak ditemukan");
    error.status = 404;
    throw error;
  }

  if (order.status !== "processing") {
    const error = new Error("Status order tidak valid untuk konfirmasi driver");
    error.status = 400;
    throw error;
  }

  await db.query(
    `
    UPDATE orders 
    SET status = 'in_delivery', updated_at = NOW()
    WHERE id = ?
    `,
    [orderId]
  );

  const [[manager]] = await db.query(
    "SELECT id, name FROM users WHERE id = ?",
    [order.manager_id]
  );

  const now = new Date();
  const title = "Order sedang dihantar";
  const message = `Order ID ${orderId} sedang dihantar ke outlet.`;

  await db.query(
    `
    INSERT INTO notifications (user_id, title, message, is_read, created_at, updated_at)
    VALUES (?, ?, ?, 0, ?, ?)
    `,
    [manager ? manager.id : null, title, message, now, now]
  );

  return { success: true };
}

async function managerConfirm(orderId, managerId) {
  const [[order]] = await db.query(
    "SELECT id, status, manager_id FROM orders WHERE id = ?",
    [orderId]
  );

  if (!order) {
    const error = new Error("Order tidak ditemukan");
    error.status = 404;
    throw error;
  }

  if (order.manager_id !== managerId) {
    const error = new Error("Tidak diizinkan mengkonfirmasi order ini");
    error.status = 403;
    throw error;
  }

  if (order.status !== "in_delivery") {
    const error = new Error("Status order tidak valid untuk konfirmasi outlet");
    error.status = 400;
    throw error;
  }

  await db.query(
    `
    UPDATE orders 
    SET status = 'completed', updated_at = NOW()
    WHERE id = ?
    `,
    [orderId]
  );

  const [admins] = await db.query(
    `
    SELECT id FROM users 
    WHERE role IN ('admin_hq', 'master_admin')
    `
  );

  const now = new Date();
  const title = "Order telah diterima outlet";
  const message = `Order ID ${orderId} telah diterima dan disahkan oleh outlet.`;

  for (const admin of admins) {
    await db.query(
      `
      INSERT INTO notifications (user_id, title, message, is_read, created_at, updated_at)
      VALUES (?, ?, ?, 0, ?, ?)
      `,
      [admin.id, title, message, now, now]
    );
  }

  return { success: true };
}

module.exports = {
  createOrder,
  listOrdersForUser,
  getOrderDetail,
  driverConfirm,
  managerConfirm,
};
