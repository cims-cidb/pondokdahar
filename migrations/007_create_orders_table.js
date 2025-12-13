exports.up = function (knex) {
  return knex.schema.createTable("orders", (table) => {
    table.increments("id").primary();
    table
      .integer("outlet_id")
      .unsigned()
      .references("id")
      .inTable("outlets")
      .onDelete("CASCADE");

    table
      .integer("manager_id")
      .unsigned()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.string("status").defaultTo("processing");

    table.timestamp("processing_at").defaultTo(knex.fn.now());
    table.timestamp("in_delivery_at").nullable();
    table.timestamp("completed_at").nullable();

    table
      .integer("driver_id")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table
      .integer("completed_by")
      .unsigned()
      .nullable()
      .references("id")
      .inTable("users")
      .onDelete("SET NULL");

    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("orders");
};
