const express = require("express");
const router = express.Router();

const attendanceController = require("../controllers/attendanceController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", attendanceController.getAttendance);
router.get("/outlet/:outletId", attendanceController.getAttendanceByOutlet);

module.exports = router;
