// TODO: define Consumption model (id, staff_id, outlet_id, total_consumption, date, status, etc.)\nconst db = require('../config/db');

module.exports = {
  all(filter) {
    return db("consumption").where(filter);
  },
  create(data) {
    return db("consumption").insert(data).returning("*");
  },
  update(id, data) {
    return db("consumption").where({ id }).update(data).returning("*");
  },
};
