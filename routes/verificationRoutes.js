const express = require("express");
const router = express.Router();
const verificationController = require("../controllers/verificationController");

router.get("/", verificationController.getAllRequests);
router.get("/:id", verificationController.getRequestById);
router.post("/:id/approve", verificationController.approveRequest);
router.post("/:id/reject", verificationController.rejectRequest);

module.exports = router;
