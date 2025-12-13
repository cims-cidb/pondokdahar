const knex = require("../config/db");

function getAll() {
  return knex("salary");
}

function update(id, data) {
  return knex("salary").where({ id }).update(data);
}

module.exports = { getAll, update };
