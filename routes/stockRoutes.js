const express = require("express");
const router = express.Router();

const { authenticate } = require("../middleware/authMiddleware");
const stockController = require("../controllers/stockController");
const auth = require("../middleware/authMiddleware");

// Semua perlu login
router.use(authenticate);

// HQ: Lihat semua stok
router.get("/", stockController.getAllStock);

// HQ: Update minimum level
router.put("/:id/min-level", stockController.updateMinLevel);

// CK: Stock In (Tambah Stok)
router.post("/in", stockController.stockIn);

// CK: History Stock In
router.get("/history", stockController.getStockHistory);

module.exports = router;
