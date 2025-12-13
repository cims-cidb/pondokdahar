exports.seed = async function (knex) {
  await knex("suppliers").del();

  await knex("suppliers").insert([
    {
      id: 1,
      name: "Supplier Daging Nusantara",
      phone: "60123456789",
      bank_account: "1234567890",
      address: "Kuala Lumpur",
    },
    {
      id: 2,
      name: "Supplier Sayur Larkin",
      phone: "60198765432",
      bank_account: "9988776655",
      address: "Larkin, Johor",
    },
  ]);
};
