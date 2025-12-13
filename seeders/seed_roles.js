exports.seed = async function (knex) {
  await knex("roles").del();
  await knex("roles").insert([
    { id: 1, name: "master_admin" },
    { id: 2, name: "admin_hq" },
    { id: 3, name: "central_kitchen" },
    { id: 4, name: "manager_outlet" },
    { id: 5, name: "driver" },
    { id: 6, name: "staff_outlet" },
  ]);
};
