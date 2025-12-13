const knex = require("../config/db");

function filter(outletId, date) {
  return knex("attendance").where({
    outlet_id: outletId,
    attendance_date: date,
  });
}

module.exports = { filter };
