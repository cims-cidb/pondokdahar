// TODO: define SupplierItem model (id, supplier_id, name, oum, price, etc.)\nconst db = require('../config/db');

module.exports = {
  all(supplier_id) {
    return db("supplier_items").where({ supplier_id });
  },
  find(id) {
    return db("supplier_items").where({ id }).first();
  },
  create(data) {
    return db("supplier_items").insert(data).returning("*");
  },
  update(id, data) {
    return db("supplier_items").where({ id }).update(data).returning("*");
  },
  remove(id) {
    return db("supplier_items").where({ id }).del();
  },
};
