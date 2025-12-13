exports.up = function (knex) {
  return knex.schema.createTable("order_items", (table) => {
    table.increments("id").primary();

    table
      .integer("order_id")
      .unsigned()
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");

    table
      .integer("supplier_item_id")
      .unsigned()
      .references("id")
      .inTable("supplier_items")
      .onDelete("CASCADE");

    table
      .integer("supplier_id")
      .unsigned()
      .references("id")
      .inTable("suppliers")
      .onDelete("CASCADE");

    table.integer("qty").notNullable();
    table.decimal("price", 10, 2).notNullable();
    table.decimal("total_amount", 10, 2).notNullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_items");
};
