// TODO: define Salary model (id, staff_id, outlet_id, month, year, total_salary, status, etc.)\nconst db = require('../config/db');

module.exports = {
  all(filter) {
    return db("salary").where(filter);
  },
  find(id) {
    return db("salary").where({ id }).first();
  },
  create(data) {
    return db("salary").insert(data).returning("*");
  },
  update(id, data) {
    return db("salary").where({ id }).update(data).returning("*");
  },
};
