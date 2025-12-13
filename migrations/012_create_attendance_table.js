exports.up = function (knex) {
  return knex.schema.createTable("attendance", (table) => {
    table.increments("id").primary();
    table.integer("user_id").unsigned().references("id").inTable("users");
    table.integer("outlet_id").unsigned().references("id").inTable("outlets");
    table.time("clock_in").notNullable();
    table.date("date").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("attendance");
};
