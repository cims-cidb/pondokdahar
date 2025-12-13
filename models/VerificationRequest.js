// TODO: define VerificationRequest model (id, type, ref_id, payload_before, payload_after, status, created_by, approved_by, etc.)\nconst db = require('../config/db');

module.exports = {
  all(filter) {
    return db("verification_requests").where(filter);
  },
  find(id) {
    return db("verification_requests").where({ id }).first();
  },
  create(data) {
    return db("verification_requests").insert(data).returning("*");
  },
  update(id, data) {
    return db("verification_requests")
      .where({ id })
      .update(data)
      .returning("*");
  },
};
