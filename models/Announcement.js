// TODO: define Announcement model (id, title, body, roles, outlet_ids, created_by, etc.)\nconst db = require('../config/db');

module.exports = {
  all() {
    return db("announcements");
  },
  find(id) {
    return db("announcements").where({ id }).first();
  },
  create(data) {
    return db("announcements").insert(data).returning("*");
  },
  update(id, data) {
    return db("announcements").where({ id }).update(data).returning("*");
  },
  remove(id) {
    return db("announcements").where({ id }).del();
  },
};
