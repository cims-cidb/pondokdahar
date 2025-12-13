const knex = require("../config/db");
const bcrypt = require("bcrypt");

async function create(data) {
  const hash = await bcrypt.hash(data.password, 10);
  data.password = hash;
  return knex("users").insert(data);
}

function getAll() {
  return knex("users");
}

function update(id, data) {
  return knex("users").where({ id }).update(data);
}

function remove(id) {
  return knex("users").where({ id }).del();
}

module.exports = { create, getAll, update, remove };
