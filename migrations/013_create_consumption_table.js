exports.up = function (knex) {
  return knex.schema.createTable("consumption", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().references("id").inTable("users");
    table.integer("outlet_id").unsigned().references("id").inTable("outlets");
    table.integer("total").defaultTo(0);
    table.date("date").notNullable();
    table.string("status").defaultTo("free");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("consumption");
};
