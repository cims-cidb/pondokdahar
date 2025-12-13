const db = require("../config/db");

async function createVerificationRequest({
  module,
  action,
  requester_id,
  payload,
}) {
  const [result] = await db.query(
    `
    INSERT INTO verification_requests (module, action, requester_id, payload, status, created_at, updated_at)
    VALUES (?, ?, ?, ?, 'pending', NOW(), NOW())
    `,
    [module, action, requester_id, JSON.stringify(payload || {})]
  );

  return result.insertId;
}

module.exports = {
  createVerificationRequest,
};
