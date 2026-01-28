const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const authMiddleware = require("../middlewares/authMiddleware");
const { QUEST_TYPE, QUEST_TO_DURATION_HOURS } = require("../constant");

router.use(authMiddleware);


// create endpoints to create, update, delete and get quests

// Create a new quest
router.post("/", async (req, res, next) => {
    const { quest_type, title, description, quest_xp, failed_xp } = req.body;
    try {
        
        if (!quest_type){
            return res.status(400).json({ message: "quest_type is required" });
        }

        quest_duration = QUEST_TO_DURATION_HOURS[quest_type.toUpperCase()];

        if (!quest_duration) {
            return res.status(400).json({ message: "Invalid quest type" });
        }

        if (!title){
            return res.status(400).json({ message: "Title is required" });
        }

        if (!description){
            return res.status(400).json({ message: "Description is required" });
        }

        // make sure quest_xp is integer
        const questXpInt = parseInt(quest_xp);
        if (isNaN(questXpInt)) {
            return res.status(400).json({ message: "quest_xp must be an integer" });
        }

        const failedXpInt = parseInt(failed_xp);
        if (isNaN(failedXpInt)) {
            return res.status(400).json({ message: "failed_xp must be an integer" });
        }

        const result = await pool.query(
            "INSERT INTO quests (quest_type, title, description, quest_xp, failed_xp, quest_duration) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
            [quest_type, title, description, questXpInt, failedXpInt, quest_duration]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        next(err);
    }
});

// Get all quests
router.get("/", async (req, res, next) => {
    try {
        const userId = req.userId;
        // get all quest 
        const result = await pool.query(
            "SELECT * FROM quests"
        );
        res.status(200).json(result.rows);
    } catch (err) {
        next(err);
    }
});

module.exports = router;