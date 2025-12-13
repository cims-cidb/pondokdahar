exports.up = function (knex) {
  return knex.schema.createTable("expenses", (table) => {
    table.increments("id").primary();
    table
      .integer("supplier_id")
      .unsigned()
      .references("id")
      .inTable("suppliers");
    table.string("invoice_no").notNullable();
    table.decimal("total_amount", 10, 2).notNullable();
    table.string("status").defaultTo("unpaid");
    table.boolean("mismatch").defaultTo(false);
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("expenses");
};
