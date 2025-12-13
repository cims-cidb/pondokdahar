// TODO: define Outlet model (id, name, address, etc.)\nconst db = require('../config/db');

module.exports = {
  all() {
    return db("outlets");
  },
  find(id) {
    return db("outlets").where({ id }).first();
  },
  create(data) {
    return db("outlets").insert(data).returning("*");
  },
  update(id, data) {
    return db("outlets").where({ id }).update(data).returning("*");
  },
  remove(id) {
    return db("outlets").where({ id }).del();
  },
};
