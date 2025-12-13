// TODO: define ExpenseItem model (id, expense_id, item_id, qty_invoice, qty_received, etc.)\nconst db = require('../config/db');

module.exports = {
  all(expense_id) {
    return db("expense_items").where({ expense_id });
  },
  create(data) {
    return db("expense_items").insert(data).returning("*");
  },
};
