const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
const { execSync } = require("child_process");

require("dotenv").config();

async function checkEnv() {
  const required = [
    "DB_HOST",
    "DB_USER",
    "DB_PASSWORD",
    "DB_NAME",
    "JWT_SECRET",
  ];

  const missing = required.filter((k) => !process.env[k]);
  return { missing, ok: missing.length === 0 };
}

async function checkDatabase() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [tables] = await conn.query(`SHOW TABLES`);
    return { ok: true, tables: tables.map((t) => Object.values(t)[0]) };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function listRoutes() {
  try {
    const app = require("./app");
    const routes = [];

    app._router.stack.forEach((m) => {
      if (m.route) {
        const methods = Object.keys(m.route.methods)
          .map((x) => x.toUpperCase())
          .join(",");
        routes.push(`${methods} ${m.route.path}`);
      } else if (m.name === "router") {
        m.handle.stack.forEach((h) => {
          if (h.route) {
            const mtd = Object.keys(h.route.methods)
              .map((x) => x.toUpperCase())
              .join(",");
            routes.push(`${mtd} ${h.route.path}`);
          }
        });
      }
    });

    return { ok: true, routes };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function checkAdminUser() {
  try {
    const conn = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    const [rows] = await conn.query(
      `SELECT id, email, role FROM users WHERE role='master_admin' LIMIT 1`
    );

    if (!rows.length) return { ok: false, error: "Master admin not found" };

    return { ok: true, admin: rows[0] };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function checkLoginEndpoint() {
  try {
    const result = execSync(
      `curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:${
        process.env.PORT || 4000
      }/api/auth/login -H "Content-Type: application/json" -d '{"email":"test","password":"test"}'`
    ).toString();

    return {
      httpStatus: Number(result.trim()),
      ok: Number(result.trim()) !== 404,
    };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

async function runDiagnose() {
  console.log("=== ENV CHECK ===");
  const env = await checkEnv();
  console.log(env);

  console.log("\n=== DATABASE CHECK ===");
  const db = await checkDatabase();
  console.log(db);

  console.log("\n=== MASTER ADMIN CHECK ===");
  const admin = await checkAdminUser();
  console.log(admin);

  console.log("\n=== ROUTE LIST ===");
  const routeList = listRoutes();
  console.log(routeList);

  console.log("\n=== LOGIN ENDPOINT CHECK ===");
  const login = await checkLoginEndpoint();
  console.log(login);

  console.log("\n=== DIAGNOSE COMPLETED ===");
}

runDiagnose();
