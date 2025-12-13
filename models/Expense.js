// TODO: define Expense model (id, supplier_id, invoice_no, total_amount, order_date, status, mismatch_flag, etc.)\nconst db = require('../config/db');

module.exports = {
  all(filter) {
    return db("expenses").where(filter);
  },
  find(id) {
    return db("expenses").where({ id }).first();
  },
  create(data) {
    return db("expenses").insert(data).returning("*");
  },
  update(id, data) {
    return db("expenses").where({ id }).update(data).returning("*");
  },
};
