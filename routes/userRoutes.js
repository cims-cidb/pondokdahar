const express = require("express");
const router = express.Router();
const user = require("../controllers/userController");

router.get("/", user.getUsers);
router.get("/:id", user.getUserById);
router.post("/", user.addUser);
router.put("/:id", user.updateUser);
router.put("/:id/suspend", user.suspendUser);
router.put("/:id/activate", user.activateUser);
router.delete("/:id", user.deleteUser);

module.exports = router;
