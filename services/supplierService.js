const knex = require("../config/db");

function getAll() {
  return knex("suppliers");
}

function create(data) {
  return knex("suppliers").insert(data);
}

function update(id, data) {
  return knex("suppliers").where({ id }).update(data);
}

function remove(id) {
  return knex("suppliers").where({ id }).del();
}

module.exports = { getAll, create, update, remove };
