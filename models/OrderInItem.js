// TODO: define OrderInItem model (id, order_in_id, item_id, qty, etc.)\nconst db = require('../config/db');

module.exports = {
  all(order_id) {
    return db("order_items").where({ order_id });
  },
  create(data) {
    return db("order_items").insert(data).returning("*");
  },
};
