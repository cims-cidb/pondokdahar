// TODO: define OrderIn model (id, outlet_id, manager_id, total_qty, status, etc.)\nconst db = require('../config/db');

module.exports = {
  all(filter) {
    return db("orders").where(filter);
  },
  find(id) {
    return db("orders").where({ id }).first();
  },
  create(data) {
    return db("orders").insert(data).returning("*");
  },
  update(id, data) {
    return db("orders").where({ id }).update(data).returning("*");
  },
};
