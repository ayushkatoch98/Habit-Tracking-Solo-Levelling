const express = require("express");
const router = express.Router();

const authMiddleware = require("../middlewares/authMiddleware");
const {
  createQuest,
  getQuests,
  updateQuest,
  deleteQuest
} = require("../controllers/questController");

router.use(authMiddleware);

router.post("/", createQuest);
router.get("/", getQuests);
router.put("/:id", updateQuest);
router.delete("/:id", deleteQuest);

module.exports = router;
