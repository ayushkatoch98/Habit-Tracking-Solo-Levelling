const express = require("express");
const router = express.Router();
const { register, login, getProfile, getXpRequired, getAllUsers} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const { xpRequiredForLevel } = require("../constant");


router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getProfile);
router.get("/", authMiddleware, getAllUsers);
router.get("/xp-required", authMiddleware, getXpRequired);

module.exports = router;
