const express = require("express");
const router = express.Router();

const salaryController = require("../controllers/salaryController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", salaryController.getSalaryList);
router.get("/:id", salaryController.getSalaryDetail);
router.put("/:id", salaryController.updateSalary);
router.post("/pay", salaryController.paySalary);

module.exports = router;
