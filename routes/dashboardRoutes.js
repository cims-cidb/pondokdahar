const express = require("express");
const router = express.Router();

const dashboardController = require("../controllers/dashboardController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/summary", dashboardController.getSummary);
router.get("/top-items", dashboardController.getTopItems);
router.get("/financial-forecast", dashboardController.getFinancialForecast);

module.exports = router;
