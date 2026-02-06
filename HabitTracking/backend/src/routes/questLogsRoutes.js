const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const authMiddleware = require("../middlewares/authMiddleware");
const { applyXpDelta, QUEST_STATUS, QUEST_TYPE } = require("../constant");

router.use(authMiddleware);

// endpoint to get quest logs for the authenticated user with filters like status and date range
router.get("/dashboard", async (req, res, next) => {
    const userId = req.userId;
    // default startDateTime = today - 2 days and endDate = today 
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const { startDate = yesterday, endDate = today } = req.query;

    let query = `SELECT ql.id as id, q.title as title, ql.status as status , q.quest_type as quest_type, q.description as description,
    q.quest_xp as quest_xp, q.failed_xp as failed_xp, ql.complete_by as complete_by, ql.assigned_at as assigned_at
    FROM quest_logs ql JOIN quests q ON ql.quest_id = q.id WHERE ql.user_id = $1`;
    const params = [userId];

    if (startDate && endDate) {
        query += " AND DATE(ql.assigned_at) BETWEEN $2 AND $3";
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


router.get("/compare", async (req, res, next) => {
    const { startDate, endDate } = req.query;

    let whereCondition = "";
    let dynamicParams = [];

    if (startDate && endDate) {
        console.log("Applying date filter", startDate, endDate);
        whereCondition = " WHERE DATE(ql.assigned_at) BETWEEN $1 AND $2 ";
        dynamicParams = [startDate, endDate];
    }

    try {
        const result = await pool.query(
            `
            WITH base AS (
                SELECT
                    u.id AS user_id,
                    u.username,
                    q.quest_type,
                    ql.status,
                    q.quest_xp,
                    q.failed_xp
                FROM quest_logs ql
                JOIN quests q ON ql.quest_id = q.id
                JOIN users u ON ql.user_id = u.id
                 ${whereCondition}
            )
            SELECT
                user_id,
                username,

                COUNT(*) FILTER (WHERE quest_type = 'DAILY_QUEST') AS daily_total,
                COUNT(*) FILTER (WHERE quest_type = 'DAILY_QUEST' AND status = 'COMPLETED') AS daily_completed,
                COUNT(*) FILTER (WHERE quest_type = 'DAILY_QUEST' AND status = 'FAILED') AS daily_failed,
                COUNT(*) FILTER (WHERE quest_type = 'DAILY_QUEST' AND status = 'PENDING') AS daily_pending,

                COUNT(*) FILTER (WHERE quest_type = 'WEEKLY_QUEST') AS weekly_total,
                COUNT(*) FILTER (WHERE quest_type = 'WEEKLY_QUEST' AND status = 'COMPLETED') AS weekly_completed,
                COUNT(*) FILTER (WHERE quest_type = 'WEEKLY_QUEST' AND status = 'FAILED') AS weekly_failed,
                COUNT(*) FILTER (WHERE quest_type = 'WEEKLY_QUEST' AND status = 'PENDING') AS weekly_pending,

                COUNT(*) FILTER (WHERE quest_type = 'PENALTY') AS penalty_assigned,
                COUNT(*) FILTER (WHERE quest_type = 'PENALTY' AND status = 'COMPLETED') AS penalty_completed,
                COUNT(*) FILTER (WHERE quest_type = 'PENALTY' AND status = 'FAILED') AS penalty_failed,

                COALESCE(SUM(quest_xp) FILTER (WHERE status = 'COMPLETED'), 0) AS xp_gained,
                COALESCE(SUM(failed_xp) FILTER (WHERE status = 'FAILED'), 0) AS xp_lost

            FROM base
            GROUP BY user_id, username
            ORDER BY username;
            `,
            dynamicParams
        );

        const users = result.rows.map(u => {
            const netXp = u.xp_gained - u.xp_lost;
            const failureRate = u.daily_total > 0
                ? +(u.daily_failed / u.daily_total * 100).toFixed(1)
                : 0;

            return {
                username: u.username,
                stats: {
                    daily_completed: Number(u.daily_completed),
                    daily_failed: Number(u.daily_failed),
                    daily_pending: Number(u.daily_pending),

                    weekly_completed: Number(u.weekly_completed),
                    weekly_failed: Number(u.weekly_failed),
                    weekly_pending: Number(u.weekly_pending),

                    penalty_assigned: Number(u.penalty_assigned),
                    penalty_completed: Number(u.penalty_completed),
                    penalty_failed: Number(u.penalty_failed),

                    xp_gained: Number(u.xp_gained),
                    xp_lost: Number(u.xp_lost),
                    net_xp: netXp,

                    failure_rate: failureRate
                }
            };
        });

        const timelineResult = await pool.query(
            `
            WITH base AS (
                SELECT
                    u.id AS user_id,
                    u.username,
                    q.quest_type,
                    ql.status,
                    q.quest_xp,
                    q.failed_xp,
                    DATE(ql.assigned_at) AS assigned_date
                FROM quest_logs ql
                JOIN quests q ON ql.quest_id = q.id
                JOIN users u ON ql.user_id = u.id
                ${whereCondition}
            )
            SELECT
                assigned_date,
                user_id,
                username,

                COUNT(*) FILTER (WHERE quest_type = 'DAILY_QUEST' AND status = 'COMPLETED') AS daily_completed,
                COUNT(*) FILTER (WHERE quest_type = 'DAILY_QUEST' AND status = 'FAILED') AS daily_failed,

                COUNT(*) FILTER (WHERE quest_type = 'WEEKLY_QUEST' AND status = 'COMPLETED') AS weekly_completed,
                COUNT(*) FILTER (WHERE quest_type = 'WEEKLY_QUEST' AND status = 'FAILED') AS weekly_failed,

                COUNT(*) FILTER (WHERE quest_type = 'PENALTY') AS penalty_assigned,

                COALESCE(SUM(quest_xp) FILTER (WHERE status = 'COMPLETED'), 0) AS xp_gained,
                COALESCE(SUM(failed_xp) FILTER (WHERE status = 'FAILED'), 0) AS xp_lost

            FROM base
            GROUP BY assigned_date, user_id, username
            ORDER BY assigned_date, username;
            `,
            dynamicParams
        );

        const timeline = timelineResult.rows.map(r => ({
            date: r.assigned_date,
            username: r.username,
            daily_completed: Number(r.daily_completed),
            daily_failed: Number(r.daily_failed),
            weekly_completed: Number(r.weekly_completed),
            weekly_failed: Number(r.weekly_failed),
            penalty_assigned: Number(r.penalty_assigned),
            xp_gained: Number(r.xp_gained),
            xp_lost: Number(r.xp_lost),
            net_xp: Number(r.xp_gained) - Number(r.xp_lost)
        }));

        // Decide winner (simple + brutal)
        let winner = null;
        if (users.length === 2) {
            winner =
                users[0].stats.net_xp >= users[1].stats.net_xp
                    ? users[0].username
                    : users[1].username;
        }

        res.status(200).json({
            range: { startDate, endDate },
            users,
            timeline,
            winner
        });

    } catch (err) {
        next(err);
    }
});


// get all quests grouped by assigned at 
router.get("/others", async (req, res, next) => {
    const userId = req.userId;
    try {
        // get all quests group by assigned at 
        const result = await pool.query(
            `SELECT
                    ql.id AS id,
                    q.title AS title,
                    ql.status AS status,
                    q.quest_type AS quest_type,
                    q.description AS description,
                    q.quest_xp AS quest_xp,
                    q.failed_xp AS failed_xp,
                    ql.complete_by AS complete_by,
                    ql.assigned_at AS assigned_at
                FROM quest_logs ql
                JOIN quests q ON ql.quest_id = q.id
                WHERE ql.user_id = $1
                ORDER BY ql.assigned_at::date DESC, ql.assigned_at DESC;
            `,
            [userId]
        );

        output = {};
        // group by assigned at date
        result.rows.forEach(questLog => {
            const dateKey = questLog.assigned_at.toISOString().split('T')[0];
            if (!output[dateKey]) {
                output[dateKey] = [];
            }
            output[dateKey].push(questLog);
        });

        res.status(200).json(output);
    } catch (err) {
        next(err);
    }
});

// endpoint to update the status of a quest log (e.g., mark as completed)
router.put("/:id", async (req, res, next) => {
    const userId = req.userId;
    const userEmail = req.userEmail;
    const questLogId = req.params.id;
    const { status } = req.body;

    if (![QUEST_STATUS.COMPLETED, QUEST_STATUS.FAILED].includes(status)) {
        return res.status(400).json({ message: "Quest can only be marked as completed or failed" });
    }

    const client = await pool.connect();

    try {

        await client.query("BEGIN");
        // Get the quest log to ensure it belongs to the user
        const questLogResult = await client.query(
            `SELECT q.id as quest_id, q.quest_xp as quest_xp, q.failed_xp as failed_xp, q.quest_type as quest_type,
                    ql.status as status, ql.id as quest_log_id, ql.complete_by as complete_by, ql.assigned_at as assigned_at
                    FROM quests q
                    JOIN quest_logs ql ON q.id = ql.quest_id
                    WHERE ql.id = $1 AND ql.user_id = $2 AND q.user_id = $2 FOR UPDATE`,
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
        if (questLogResult.rows[0].status === QUEST_STATUS.FAILED) {
            await client.query("ROLLBACK");
            return res.status(400).json({ message: "Quest log is already failed" });
        }

        if (status === QUEST_STATUS.COMPLETED) {
            console.log("complete by", questLogResult.rows[0].complete_by, "new Date()", new Date());
            if (new Date() > new Date(questLogResult.rows[0].complete_by)) {
                await client.query("ROLLBACK");
                return res.status(400).json({ message: "Cannot complete quest log after its completion deadline" });
            }
        }

        const updateResult = await client.query(
            "UPDATE quest_logs SET status = $1 WHERE id = $2 and user_id = $3 RETURNING *",
            [status, questLogId, userId]
        );
        updatedQuestLog = updateResult.rows[0];
        const questXp = questLogResult.rows[0].quest_xp;
        const failedXp = questLogResult.rows[0].failed_xp;
        const questType = questLogResult.rows[0].quest_type;

        if (status === QUEST_STATUS.COMPLETED) {
            await applyXpDelta(userId, userEmail, questXp, client);
        } else if (status === QUEST_STATUS.FAILED) {
            if (failedXp > 0) {
                await applyXpDelta(userId, userEmail, -failedXp, client);
            }
            if (questType !== QUEST_TYPE.PENALTY) {
                const pendingPenaltyResult = await client.query(
                    `SELECT 1
                     FROM quest_logs ql
                     JOIN quests q ON ql.quest_id = q.id
                     WHERE ql.user_id = $1 AND q.quest_type = $2 AND ql.status = $3
                     LIMIT 1`,
                    [userId, QUEST_TYPE.PENALTY, QUEST_STATUS.PENDING]
                );
                if (pendingPenaltyResult.rows.length === 0) {
                const penaltyQuestResult = await client.query(
                    `SELECT id, quest_duration FROM quests WHERE quest_type = $1 AND user_id = $2 ORDER BY RANDOM() LIMIT 1`,
                    [QUEST_TYPE.PENALTY, userId]
                );
                    if (penaltyQuestResult.rows.length > 0) {
                        const penaltyQuestId = penaltyQuestResult.rows[0].id;
                        const penaltyQuestDuration = penaltyQuestResult.rows[0].quest_duration;
                        await client.query(
                            `INSERT INTO quest_logs (user_id, quest_id, status, assigned_at, complete_by) 
                             VALUES ($1, $2, $3, NOW(), NOW() + ($4 || ' minutes')::interval)`,
                            [userId, penaltyQuestId, QUEST_STATUS.PENDING, penaltyQuestDuration]
                        );
                    }
                }
            }
        }


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
