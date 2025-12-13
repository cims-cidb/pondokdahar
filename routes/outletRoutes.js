const express = require("express");
const router = express.Router();

const outletController = require("../controllers/outletController");

router.get("/", outletController.getOutlets);
router.get("/:id", outletController.getOutletById);
router.post("/", outletController.createOutlet);
router.put("/:id", outletController.updateOutlet);
router.delete("/:id", outletController.requestDeleteOutlet);
router.get("/:id/standards", outletController.getOutletStandards);
router.put("/:id/standards", outletController.updateOutletStandards);

module.exports = router;
