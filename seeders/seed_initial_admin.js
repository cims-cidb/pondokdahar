const bcrypt = require("bcrypt");

exports.seed = async function (knex) {
  await knex("users").del();

  const passwordHash = await bcrypt.hash("Iktafa#2020", 10);

  await knex("users").insert({
    name: "Master Admin Pondok Dahar",
    email: "daharculinaryholdings@gmail.com",
    password_hash: passwordHash,
    phone: null,
    whatsapp: null,
    role: "master_admin",
    outlet_id: null,
    daily_salary: 0,
    bank_name: null,
    bank_account: null,
    status: "active",
  });
};
