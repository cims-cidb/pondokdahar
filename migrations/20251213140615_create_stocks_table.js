exports.up = function (knex) {
  return knex.schema.createTable("stocks", function (table) {
    table.increments("id").primary();

    table
      .integer("item_id")
      .unsigned()
      .notNullable()
      .references("id")
      .inTable("stock_items")
      .onDelete("CASCADE");

    table.enum("type", ["in", "out"]).notNullable().comment("Stock IN or OUT");

    table.integer("qty").notNullable();

    table
      .integer("created_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("stocks");
};
