const knex = require("../config/db");

function getAll() {
  return knex("stock_items");
}

function updateItem(id, data) {
  return knex("stock_items").where({ id }).update(data);
}

module.exports = { getAll, updateItem };
