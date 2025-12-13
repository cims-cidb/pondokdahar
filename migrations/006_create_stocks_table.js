exports.up = function (knex) {
  return knex.schema.createTable("stock_items", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.integer("standard_level").defaultTo(0);
    table.integer("actual_stock").defaultTo(0);
    table.string("status").defaultTo("aman");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stock_items");
};
