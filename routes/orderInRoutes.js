const express = require("express");
const router = express.Router();

const orderInController = require("../controllers/orderInController");

router.post("/", orderInController.createOrder);
router.get("/", orderInController.listOrders);
router.get("/:id", orderInController.getOrderDetail);
router.post("/:id/driver-confirm", orderInController.driverConfirmItems);
router.post("/:id/manager-confirm", orderInController.managerConfirmItems);

module.exports = router;
