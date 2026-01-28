const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const { applyXpDelta, QUEST_STATUS } = require("../constant");

router.use(authMiddleware);

// endpoint to get quest logs for the authenticated user with filters like status and date range
router.get("/", async (req, res, next) => {
    const userId = req.userId;
    // default startDateTime = today - 2 days and endDate = today 
    const { status, startDate = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), endDate = new Date().toISOString() } = req.query;

    let query = `SELECT ql.id as id, q.title as title, ql.status as status , q.quest_type as quest_type, q.description as description, ql.complete_by as complete_by, ql.assigned_at as assigned_at
    FROM quest_logs ql JOIN quests q ON ql.quest_id = q.id WHERE ql.user_id = $1 AND ql.status != $2 `;
    const params = [userId, QUEST_STATUS.FAILED];

    if (status) {
        query += " AND ql.status = $2";
        params.push(status);
    }

    if (startDate && endDate) {
        query += " AND ql.assigned_at >= $3 AND ql.assigned_at <= $4";
        params.push(startDate, endDate);
    }

    query += " ORDER BY ql.assigned_at DESC";

    try {
        const result = await pool.query(query, params);
        res.status(200).json(result.rows);
    } catch (err) {
        next(err);
    }
});


// comparison endpoint that compare data between two dates and all the users in the system
router.get("/compare", async (req, res, next) => {
    const { status, startDate, endDate } = req.query;

    const userId = req.userId;

    // I want data like, quest completed, quest failed, penalty quest assigned , pending quests, penalty quest failed, completed etc. also join users table
    let query = `SELECT ql.id as id, q.title as title, ql.status as status , q.quest_type as quest_type, q.description as description, ql.complete_by as complete_by, ql.assigned_at as assigned_at
                FROM quest_logs ql JOIN quests q ON ql.quest_id = q.id WHERE ql.user_id = $1
                `;

    const params = [userId];
    let paramIndex = 2;

    if (status) {
        query += ` AND ql.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
    }
    if (startDate && endDate) {
        query += ` AND ql.assigned_at BETWEEN $${paramIndex} AND $${paramIndex + 1}`;
        params.push(startDate, endDate);
        paramIndex += 2;
    }
    query += " ORDER BY ql.assigned_at DESC";
    try {
        const result = await pool.query(query, params);

        // categorize the results by status, quest_type, failed or completed within deadline etc.
        const output = {}

        output["completed"] = result.rows.filter(q => q.status === QUEST_STATUS.COMPLETED);
        output["failed"] = result.rows.filter(q => q.status === QUEST_STATUS.FAILED);
        output["pending"] = result.rows.filter(q => q.status === QUEST_STATUS.PENDING);
        output["penalty"] = result.rows.filter(q => q.quest_type === "PENALTY");

        output["penalty_completed"] = output["penalty"].filter(q => q.status === QUEST_STATUS.COMPLETED);
        output["penalty_failed"] = output["penalty"].filter(q => q.status === QUEST_STATUS.FAILED);
        output["penalty_pending"] = output["penalty"].filter(q => q.status === QUEST_STATUS.PENDING);

        output["completed_within_deadline"] = output["completed"].filter(q => new Date(q.complete_by) >= new Date(q.assigned_at));

        output["completed_after_deadline"] = output["completed"].filter(q => new Date(q.complete_by) < new Date(q.assigned_at));

        output["daily_quests_completed"] = output["completed"].filter(q => {
            const assignedDate = new Date(q.assigned_at);
            const completedDate = new Date(q.complete_by);
            return (completedDate - assignedDate) <= 24 * 60 * 60 * 1000; // within 24 hours
        });

        output["daily_quests_failed"] = output["failed"].filter(q => {
            const assignedDate = new Date(q.assigned_at);
            const failedDate = new Date(q.complete_by);
            return (failedDate - assignedDate) <= 24 * 60 * 60 * 1000; // within 24 hours
        });

        res.status(200).json(output);
    } catch (err) {
        next(err);
    }

});

// get failed quests
router.get("/failed", async (req, res, next) => {
    const userId = req.userId;
    try {
        const result = await pool.query(
            `SELECT ql.id as id, q.title as title, ql.status as status , q.quest_type as quest_type, q.description as description, ql.complete_by as complete_by, ql.assigned_at as assigned_at 
             FROM quest_logs ql JOIN quests q ON ql.quest_id = q.id 
             WHERE ql.user_id = $1 AND ql.status = $2 ORDER BY ql.assigned_at DESC`,
            [userId, QUEST_STATUS.FAILED]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        next(err);
    }
});

// endpoint to update the status of a quest log (e.g., mark as completed)
router.put("/:id", async (req, res, next) => {
    const userId = req.userId;
    const questLogId = req.params.id;
    const { status } = req.body;

    if (status !== QUEST_STATUS.COMPLETED) {
        return res.status(400).json({ message: "Quest can only be marked as completed" });
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");
        // Get the quest log to ensure it belongs to the user
        const questLogResult = await client.query(
            `SELECT q.id as quest_id, q.quest_xp as quest_xp, ql.status as status, ql.id as quest_log_id, ql.complete_by as complete_by, ql.assigned_at as assigned_at
                    FROM quests q
                    JOIN quest_logs ql ON q.id = ql.quest_id
                    WHERE ql.id = $1 AND ql.user_id = $2 FOR UPDATE`,
            [questLogId, userId]
        );


        if (questLogResult.rows.length === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Quest log not found" });
        }

        let updatedQuestLog = {}

        if (questLogResult.rows[0].status === QUEST_STATUS.COMPLETED) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Quest log is already completed" });
        }
        
        console.log("complete by", questLogResult.rows[0].complete_by, "new Date()", new Date());
        if (new Date() > new Date(questLogResult.rows[0].complete_by)) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Cannot complete quest log after its completion deadline" });
        }

        const updateResult = await client.query(
            "UPDATE quest_logs SET status = $1 WHERE id = $2 and user_id = $3 RETURNING *",
            [status, questLogId, userId]
        );
        updatedQuestLog = updateResult.rows[0];
        // Add XP to user
        const questXp = questLogResult.rows[0].quest_xp;
        await applyXpDelta(userId, questXp, client);


        await client.query("COMMIT");
        res.status(200).json(updatedQuestLog);
    } catch (err) {
        await client.query("ROLLBACK");
        next(err);
    } finally {
        client.release();
    }
});
module.exports = router;
