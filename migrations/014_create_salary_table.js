exports.up = function (knex) {
  return knex.schema.createTable("salary", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().references("id").inTable("users");
    table.integer("outlet_id").unsigned().references("id").inTable("outlets");
    table.integer("month");
    table.integer("year");
    table.decimal("total_salary", 10, 2).defaultTo(0);
    table.string("status").defaultTo("unpaid");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("salary");
};
