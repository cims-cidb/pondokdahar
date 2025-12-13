exports.up = function (knex) {
  return knex.schema.createTable("supplier_items", (table) => {
    table.increments("id").primary();
    table
      .integer("supplier_id")
      .unsigned()
      .references("id")
      .inTable("suppliers")
      .onDelete("CASCADE");
    table.string("name").notNullable();
    table.string("oum").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("supplier_items");
};
