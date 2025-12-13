const db = require("../config/db");

exports.getNotifications = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT id, title, message, module, user_role, is_read, created_at
      FROM notifications
      WHERE user_role = ?
      ORDER BY created_at DESC
      LIMIT 50
      `,
      [req.user.role]
    );

    res.json(rows);
  } catch (err) {
    next(err);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    await db.query(
      `
      UPDATE notifications
      SET is_read = 1
      WHERE user_role = ?
      `,
      [req.user.role]
    );

    res.json({ message: "All notifications marked as read" });
  } catch (err) {
    next(err);
  }
};

exports.createNotification = async (data) => {
  const title = data.title;
  const message = data.message;
  const moduleName = data.module;
  const role = data.role;

  await db.query(
    `
    INSERT INTO notifications (title, message, module, user_role)
    VALUES (?, ?, ?, ?)
    `,
    [title, message, moduleName, role]
  );
};
