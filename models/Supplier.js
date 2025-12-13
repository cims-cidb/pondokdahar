// TODO: define Supplier model (id, name, whatsapp, account_no, address, etc.)\nconst db = require('../config/db');

module.exports = {
  all() {
    return db("suppliers");
  },
  find(id) {
    return db("suppliers").where({ id }).first();
  },
  create(data) {
    return db("suppliers").insert(data).returning("*");
  },
  update(id, data) {
    return db("suppliers").where({ id }).update(data).returning("*");
  },
  remove(id) {
    return db("suppliers").where({ id }).del();
  },
};
