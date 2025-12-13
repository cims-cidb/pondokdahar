exports.up = function (knex) {
  return knex.schema.createTable("expense_items", (table) => {
    table.increments("id").primary();
    table
      .integer("expense_id")
      .unsigned()
      .references("id")
      .inTable("expenses")
      .onDelete("CASCADE");
    table
      .integer("supplier_item_id")
      .unsigned()
      .references("id")
      .inTable("supplier_items");
    table.integer("qty").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("expense_items");
};
