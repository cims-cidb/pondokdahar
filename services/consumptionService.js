const knex = require("../config/db");

function filter(outletId, date) {
  return knex("consumption").where({
    outlet_id: outletId,
    consumption_date: date,
  });
}

module.exports = { filter };
