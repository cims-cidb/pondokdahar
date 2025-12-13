exports.up = function (knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("name").notNullable();
    table.string("email").notNullable().unique();
    table.string("password_hash").notNullable();
    table.string("phone").nullable();
    table.string("whatsapp").nullable();
    table
      .enu("role", [
        "master_admin",
        "admin_hq",
        "central_kitchen",
        "manager_outlet",
        "driver",
        "staff_outlet",
      ])
      .notNullable();
    table.integer("outlet_id").unsigned().nullable();
    table.decimal("daily_salary", 10, 2).defaultTo(0);
    table.string("bank_name").nullable();
    table.string("bank_account").nullable();
    table
      .enu("status", ["active", "suspended"])
      .notNullable()
      .defaultTo("active");
    table.timestamps(true, true);
    table.timestamp("deleted_at").nullable();
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("users");
};
