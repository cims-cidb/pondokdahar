const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db");
const createError = require("../utils/createError");

const JWT_SECRET = process.env.JWT_SECRET || "dev_jwt_secret";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "dev_refresh_secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";
const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || "7d";

function signAccessToken(user) {
  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    outlet_id: user.outlet_id,
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

function signRefreshToken(user) {
  const payload = {
    id: user.id,
    role: user.role,
    outlet_id: user.outlet_id,
  };

  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: REFRESH_EXPIRES_IN,
  });
}

exports.login = async (email, password) => {
  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      outlet_id,
      status
    FROM users
    WHERE email = ? AND deleted_at IS NULL
    LIMIT 1
    `,
    [email]
  );

  if (!rows.length) {
    throw createError(401, "Email atau password salah");
  }

  const user = rows[0];

  if (user.status !== "active") {
    throw createError(403, "Akaun anda telah disekat");
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw createError(401, "Email atau password salah");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      outletId: user.outlet_id,
      status: user.status,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};

exports.verifyRefreshToken = async (token) => {
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_REFRESH_SECRET);
  } catch (err) {
    throw createError(401, "Refresh token tidak sah");
  }

  const [rows] = await db.query(
    `
    SELECT
      id,
      name,
      email,
      password_hash,
      role,
      outlet_id,
      status
    FROM users
    WHERE id = ? AND deleted_at IS NULL
    LIMIT 1
    `,
    [decoded.id]
  );

  if (!rows.length) {
    throw createError(404, "User tidak ditemukan");
  }

  const user = rows[0];

  if (user.status !== "active") {
    throw createError(403, "Akaun anda telah disekat");
  }

  const accessToken = signAccessToken(user);
  const refreshToken = signRefreshToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      outletId: user.outlet_id,
      status: user.status,
    },
    tokens: {
      accessToken,
      refreshToken,
    },
  };
};
