// TODO: define User model (id, name, email, whatsapp, role, outlet_id, salary_daily, bank_name, account_no, status, etc.)\nconst db = require('../config/db');

module.exports = {
  all(filter) {
    return db("users").where(filter);
  },
  find(id) {
    return db("users").where({ id }).first();
  },
  findByEmail(email) {
    return db("users").where({ email }).first();
  },
  create(data) {
    return db("users").insert(data).returning("*");
  },
  update(id, data) {
    return db("users").where({ id }).update(data).returning("*");
  },
  remove(id) {
    return db("users").where({ id }).del();
  },
};
