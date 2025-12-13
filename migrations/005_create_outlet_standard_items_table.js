exports.up = function (knex) {
  return knex.schema.createTable("outlet_item_standards", (table) => {
    table.increments("id").primary();
    table
      .integer("outlet_id")
      .unsigned()
      .references("id")
      .inTable("outlets")
      .onDelete("CASCADE");
    table
      .integer("supplier_item_id")
      .unsigned()
      .references("id")
      .inTable("supplier_items")
      .onDelete("CASCADE");
    table.integer("standard_level").defaultTo(0);
    table.string("oum").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("outlet_item_standards");
};
