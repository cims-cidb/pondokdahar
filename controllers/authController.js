console.log("AUTH CONTROLLER FILE EXECUTED");

const authService = require("../services/authService");
const db = require("../config/db");
const createError = require("../utils/createError");

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw createError(400, "Email and password are required");
    }

    const { user, tokens } = await authService.login(email, password);

    res.json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      throw createError(400, "Refresh token is required");
    }

    const { user, tokens } = await authService.verifyRefreshToken(refreshToken);

    res.json({
      user,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `
      SELECT id, name, email, role, outlet_id, status
      FROM users
      WHERE id = ?
      LIMIT 1
      `,
      [req.user.id]
    );

    if (!rows.length) {
      throw createError(404, "User not found");
    }

    const row = rows[0];

    res.json({
      id: row.id,
      name: row.name,
      email: row.email,
      role: row.role,
      outletId: row.outlet_id,
      status: row.status,
    });
  } catch (err) {
    next(err);
  }
};

exports.logout = async (req, res, next) => {
  try {
    res.json({ message: "Logged out" });
  } catch (err) {
    next(err);
  }
};
