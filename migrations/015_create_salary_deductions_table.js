exports.up = function (knex) {
  return knex.schema.createTable("salary_deductions", (table) => {
    table.increments("id").primary();
    table
      .integer("salary_id")
      .unsigned()
      .references("id")
      .inTable("salary")
      .onDelete("CASCADE");
    table.decimal("amount", 10, 2).defaultTo(0);
    table.string("type").notNullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("salary_deductions");
};
