exports.up = function (knex) {
  return knex.schema.createTable("announcements", (table) => {
    table.increments("id").primary();
    table.string("title").notNullable();
    table.string("target_roles").notNullable();
    table.string("target_outlet").nullable();
    table.text("content").notNullable();
    table.string("attachment").nullable();
    table.timestamps(true, true);
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("announcements");
};
