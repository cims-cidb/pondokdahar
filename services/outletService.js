const knex = require("../config/db");

function getAll() {
  return knex("outlets");
}

function create(data) {
  return knex("outlets").insert(data);
}

function update(id, data) {
  return knex("outlets").where({ id }).update(data);
}

function remove(id) {
  return knex("outlets").where({ id }).del();
}

module.exports = { getAll, create, update, remove };
