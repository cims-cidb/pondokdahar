exports.up = function (knex) {
  return knex.schema.createTable("order_supplier_groups", (table) => {
    table.increments("id").primary();

    table
      .integer("order_id")
      .unsigned()
      .references("id")
      .inTable("orders")
      .onDelete("CASCADE");

    table
      .integer("supplier_id")
      .unsigned()
      .references("id")
      .inTable("suppliers")
      .onDelete("CASCADE");

    table.decimal("total_amount", 10, 2).defaultTo(0);

    table.string("invoice_no").nullable();
    table.integer("invoice_sequence").nullable();

    table.string("status").defaultTo("processing");

    table.timestamp("processing_at").defaultTo(knex.fn.now());
    table.timestamp("in_delivery_at").nullable();
    table.timestamp("completed_at").nullable();

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("order_supplier_groups");
};
