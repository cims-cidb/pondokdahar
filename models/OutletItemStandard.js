// TODO: define OutletItemStandard model (id, outlet_id, item_id, standard_level, oum)\nconst db = require('../config/db');

module.exports = {
  all(outlet_id) {
    return db("outlet_item_standards").where({ outlet_id });
  },
  create(data) {
    return db("outlet_item_standards").insert(data).returning("*");
  },
  update(id, data) {
    return db("outlet_item_standards")
      .where({ id })
      .update(data)
      .returning("*");
  },
};
