exports.up = function (knex) {
  return knex.schema.createTable("outlets", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("address").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("outlets");
};
