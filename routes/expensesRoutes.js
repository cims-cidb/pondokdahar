const express = require("express");
const router = express.Router();

const expensesController = require("../controllers/expensesController");

router.get("/", expensesController.getExpenses);
router.get("/:id/mismatch", expensesController.getMismatchDetail);
router.put("/:id/update-amount", expensesController.updateAmount);
router.post("/pay", expensesController.payExpenses);

module.exports = router;
