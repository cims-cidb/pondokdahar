const knex = require("../config/db");

function getAll() {
  return knex("announcements");
}

function create(data) {
  return knex("announcements").insert(data);
}

module.exports = { getAll, create };
