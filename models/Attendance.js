// TODO: define Attendance model (id, staff_id, outlet_id, clock_in_time, date, etc.)\nconst db = require('../config/db');

module.exports = {
  all(filter) {
    return db("attendance").where(filter);
  },
  create(data) {
    return db("attendance").insert(data).returning("*");
  },
};
