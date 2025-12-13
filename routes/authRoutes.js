const express = require("express");
const router = express.Router();

const authController = require("../controllers/authController");
const { authenticate } = require("../middleware/authMiddleware");

router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshToken);
router.post("/logout", authenticate, authController.logout);
router.get("/me", authenticate, authController.getMe);

console.log(
  "DEBUG ROUTES INSIDE AUTH FILE:",
  router.stack.map((r) => r.route && r.route.path).filter(Boolean)
);

console.log(
  "EXPORTING ROUTER CONTENTS:",
  router.stack.map((r) => r.route?.path)
);
module.exports = router;
