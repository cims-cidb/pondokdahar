const express = require("express");
const router = express.Router();

const announcementController = require("../controllers/announcementController");

router.get("/", announcementController.getAnnouncements);
router.post("/", announcementController.createAnnouncement);
router.get("/:id", announcementController.getAnnouncementDetail);

module.exports = router;
