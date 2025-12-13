exports.up = function (knex) {
  return knex.schema.createTable("suppliers", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("whatsapp").nullable();
    table.string("bank_account").nullable();
    table.string("address").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("suppliers");
};
