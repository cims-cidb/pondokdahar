exports.seed = async function (knex) {
  await knex("outlets").del();

  await knex("outlets").insert([
    { id: 1, name: "Outlet Senai", location: "Senai, Johor" },
    { id: 2, name: "Outlet Kempas", location: "Kempas, Johor" },
  ]);
};
