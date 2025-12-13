const db = require("../config/db");

exports.create = async (userId, title, message) => {
  await db.query(
    `
    INSERT INTO notifications (user_id, title, message, is_read, created_at, updated_at)
    VALUES (?, ?, ?, 0, NOW(), NOW())
    `,
    [userId, title, message]
  );
};

exports.broadcast = async (roles, title, message) => {
  const placeholders = roles.map(() => "?").join(",");
  const [users] = await db.query(
    `SELECT id FROM users WHERE role IN (${placeholders})`,
    roles
  );

  for (const u of users) {
    await this.create(u.id, title, message);
  }
};
