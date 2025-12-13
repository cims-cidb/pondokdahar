exports.up = function (knex) {
  return knex.schema.createTable("verification_requests", (table) => {
    table.increments("id").primary();
    table.string("type").notNullable();
    table.integer("ref_id").unsigned().notNullable();
    table.json("data_before").nullable();
    table.json("data_after").nullable();
    table.string("status").defaultTo("pending");
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("verification_requests");
};
