// TODO: define SalaryDeduction model (id, salary_id, type, amount, description, etc.)\nconst db = require('../config/db');

module.exports = {
  all(salary_id) {
    return db("salary_deductions").where({ salary_id });
  },
  create(data) {
    return db("salary_deductions").insert(data).returning("*");
  },
};
