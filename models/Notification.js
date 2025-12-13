// TODO: define Notification model (id, user_id, title, body, type, is_read, created_at, etc.)\nconst db = require('../config/db');

module.exports = {
  all(user_id) {
    return db("notifications").where({ user_id });
  },
  create(data) {
    return db("notifications").insert(data).returning("*");
  },
  markRead(id) {
    return db("notifications").where({ id }).update({ is_read: true });
  },
};
