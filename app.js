console.log("=== APP STARTED ===");

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const helmet = require("helmet");
require("dotenv").config();

const { notFoundHandler, errorHandler } = require("./middleware/errorHandler");
const { authenticate } = require("./middleware/authMiddleware");

const authRoutes = require("./routes/authRoutes");
const supplierRoutes = require("./routes/supplierRoutes");
const stockRoutes = require("./routes/stockRoutes");
const orderInRoutes = require("./routes/orderInRoutes");
const userRoutes = require("./routes/userRoutes");
const outletRoutes = require("./routes/outletRoutes");
const expensesRoutes = require("./routes/expensesRoutes");
const announcementRoutes = require("./routes/announcementRoutes");
const consumptionRoutes = require("./routes/consumptionRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const salaryRoutes = require("./routes/salaryRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const verificationRoutes = require("./routes/verificationRoutes");
const notificationRoutes = require("./routes/notificationRoutes");

const app = express();

/* ----------------- BASIC MIDDLEWARES ----------------- */
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

/* ----------------- CORS (HARUS SEBELUM ROUTES & DEBUG) ----------------- */
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-user-role"],
  })
);

/* ----------------- FIX OPTIONS REQUEST ----------------- */
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, PATCH, DELETE, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization, x-user-role"
    );
    return res.status(200).json({});
  }
  next();
});

/* ----------------- DEBUG LOGGER ----------------- */
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

/* ----------------- HEALTH CHECK ----------------- */
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

/* ----------------- PUBLIC ROUTES ----------------- */
app.use("/api/auth", authRoutes);
console.log("=== AUTH ROUTES MOUNTED ===");

/* ----------------- PROTECTED ROUTES ----------------- */
app.use(authenticate); // satu kali untuk semua route bawah ini
app.use("/api/suppliers", supplierRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/order-in", orderInRoutes);
app.use("/api/users", userRoutes);
app.use("/api/outlets", outletRoutes);
app.use("/api/expenses", expensesRoutes);
app.use("/api/announcements", announcementRoutes);
app.use("/api/consumption", consumptionRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/salary", salaryRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/verifications", verificationRoutes);
app.use("/api/notifications", notificationRoutes);

/* ----------------- ERROR HANDLERS ----------------- */
app.use(notFoundHandler);
app.use(errorHandler);

/* ----------------- DEBUG ROUTES LOADED ----------------- */
console.log(
  ">>> ROUTES LOADED:",
  app._router?.stack?.filter((r) => r.route)?.map((r) => r.route.path)
);

module.exports = app;
