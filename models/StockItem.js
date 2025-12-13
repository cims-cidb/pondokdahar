// TODO: define StockItem model (id, name, standard_level, actual_stock, status, etc.)\nconst db = require('../config/db');

module.exports = {
  all() {
    return db("stock_items");
  },
  find(id) {
    return db("stock_items").where({ id }).first();
  },
  create(data) {
    return db("stock_items").insert(data).returning("*");
  },
  update(id, data) {
    return db("stock_items").where({ id }).update(data).returning("*");
  },
};
