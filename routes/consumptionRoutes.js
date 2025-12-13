const express = require("express");
const router = express.Router();

const consumptionController = require("../controllers/consumptionController");
const { authenticate } = require("../middleware/authMiddleware");

router.use(authenticate);

router.get("/", consumptionController.getConsumption);
router.get("/outlet/:outletId", consumptionController.getConsumptionByOutlet);
router.post("/", consumptionController.addConsumption);

module.exports = router;
