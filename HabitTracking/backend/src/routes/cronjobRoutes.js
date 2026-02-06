const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { QUEST_STATUS, QUEST_TYPE, applyXpDelta } = require("../constant");


async function hasPendingQuestType(userId, quest_type, client) {
    const result = await client.query(
        `SELECT 1
         FROM quest_logs ql
         JOIN quests q ON ql.quest_id = q.id
         WHERE ql.user_id = $1
           AND q.user_id = $1
           AND q.quest_type = $2
           AND ql.status = $3
         LIMIT 1`,
        [userId, quest_type, QUEST_STATUS.PENDING]
    );
    return result.rows.length > 0;
}

function isAfterHourUtc(hourUtc) {
    const now = new Date();
    return now.getUTCHours() >= hourUtc;
}

function isMondayUtc() {
    const now = new Date();
    return now.getUTCDay() === 1;
}

async function hasAssignedThisWeek(userId, quest_type, client) {
    const result = await client.query(
        `SELECT 1
         FROM quest_logs ql
         JOIN quests q ON ql.quest_id = q.id
         WHERE ql.user_id = $1
           AND q.user_id = $1
           AND q.quest_type = $2
           AND date_trunc('week', ql.assigned_at) = date_trunc('week', NOW())
         LIMIT 1`,
        [userId, quest_type]
    );
    return result.rows.length > 0;
}

async function assignAllQuestsByTypeForToday(userId, userEmail, quest_type, client) {
    console.log("Assigning all quests of type", quest_type, "to user", userEmail);
    await client.query(
        `INSERT INTO quest_logs (user_id, quest_id, status, assigned_at, complete_by)
         SELECT $1, q.id, $2, NOW(), NOW() + (q.quest_duration || ' minutes')::interval
         FROM quests q
         WHERE q.quest_type = $3
           AND q.user_id = $1
           AND NOT EXISTS (
             SELECT 1
             FROM quest_logs ql
             WHERE ql.user_id = $1
               AND ql.quest_id = q.id
               AND ql.assigned_date = CURRENT_DATE
           )`,
        [userId, QUEST_STATUS.PENDING, quest_type]
    );
}

async function assignPenaltyQuestToUser(userId, userEmail, client) {
    console.log("Assigning penalty quest to user", userEmail);
    const hasPending = await hasPendingQuestType(userId, QUEST_TYPE.PENALTY, client);
    if (hasPending) {
        console.log(`User ${userEmail} already has a pending penalty quest. Skipping assignment.`);
        return;
    }
    const penaltyQuestResult = await client.query(
        `SELECT id, quest_duration FROM quests WHERE quest_type = $1 AND user_id = $2 ORDER BY RANDOM() LIMIT 1`,
        [QUEST_TYPE.PENALTY, userId]
    );

    if (penaltyQuestResult.rows.length > 0) {
        const penaltyQuestId = penaltyQuestResult.rows[0].id;
        const penaltyQuestDuration = penaltyQuestResult.rows[0].quest_duration;
        await client.query(
            `INSERT INTO quest_logs (user_id, quest_id, status, assigned_at, complete_by) 
             VALUES ($1, $2, $3, NOW(), NOW() + ($4 || ' minutes')::interval)
             ON CONFLICT DO NOTHING`,
            [userId, penaltyQuestId, QUEST_STATUS.PENDING, penaltyQuestDuration]
        );
        console.log(`Assigned penalty quest to user ${userEmail} for failing daily quest.`);
    }
}

async function markPendingQuestAsFailed(userId, userEmail, quest_type, client) {
    // Check for pending daily quests and mark them as FAILED and get fail_xp to subtract later
    console.log(`Marking pending ${quest_type} quests as failed for user`, userEmail);
    const pendingQuestResult = await client.query(
        `SELECT ql.id, q.failed_xp AS failed_xp
         FROM quest_logs ql
         JOIN quests q ON ql.quest_id = q.id
            WHERE ql.user_id = $1
                AND q.quest_type = $2
                AND ql.status = $3
                AND ql.complete_by < NOW()
                `,
        [userId, quest_type, QUEST_STATUS.PENDING]
    );

    if (pendingQuestResult.rows.length > 0) {
        // Mark the pending daily quest as FAILED
        // get all failed quest ids
        const failedQuestIds = pendingQuestResult.rows.map(row => row.id);
        const totalFailedXp = pendingQuestResult.rows.reduce((sum, row) => sum + row.failed_xp, 0);

        await client.query('BEGIN'); // Start a new transaction
        try{

            await client.query(
                `UPDATE quest_logs 
                 SET status = $1 
                 WHERE id = ANY($2::uuid[])`,
                [QUEST_STATUS.FAILED, failedQuestIds]
            );

        }catch(err){
            await client.query('ROLLBACK');
            console.log(`Failed to mark pending quest as failed for user ${userEmail}`, err);
        }
        finally {
            await client.query('COMMIT');
        }

        return { assignPenalty: true, totalFailedXp };
    }
    return { assignPenalty: false, totalFailedXp: 0 };
}

router.get("/run", async (req, res) => {

    console.log("Running daily quest assignment cron job...");
    try {
        const client = await pool.connect();
        try {

            // Get all users
            const usersResult = await client.query("SELECT id, email FROM users");
            const users = usersResult.rows;
            for (const user of users) {
                const userId = user.id;
                const userEmail = user.email;
                // Mark expired pending quests as failed
                const { assignPenalty, totalFailedXp } = await markPendingQuestAsFailed(userId, userEmail, QUEST_TYPE.DAILY_QUEST, client);
                const { assignPenalty: assignPenalty2, totalFailedXp: totalFailedXp2 } = await markPendingQuestAsFailed(userId, userEmail, QUEST_TYPE.PENALTY, client);
                const { assignPenalty: assignPenalty3, totalFailedXp: totalFailedXp3 } = await markPendingQuestAsFailed(userId, userEmail, QUEST_TYPE.WEEKLY_QUEST, client);
                // Assign penalty quest if anything failed
                if (assignPenalty || assignPenalty2 || assignPenalty3) {
                    // Subtract failed XP
                    const finalTotalFailedXp = totalFailedXp + totalFailedXp2 + totalFailedXp3;
                    if (finalTotalFailedXp > 0) {
                        await applyXpDelta(userId, userEmail, -finalTotalFailedXp, client);
                    }
                    await assignPenaltyQuestToUser(userId, userEmail, client);
                }
                // Assign all daily quests once per day after 3am
                if (isAfterHourUtc(3)) {
                    await assignAllQuestsByTypeForToday(userId, userEmail, QUEST_TYPE.DAILY_QUEST, client);
                }
                // Assign all weekly quests on Mondays after 3am, only once per week
                if (isAfterHourUtc(3) && isMondayUtc() && !(await hasAssignedThisWeek(userId, QUEST_TYPE.WEEKLY_QUEST, client))) {
                    await assignAllQuestsByTypeForToday(userId, userEmail, QUEST_TYPE.WEEKLY_QUEST, client);
                }

            }
        } finally {
            client.release();
        }
    } catch (err) {
        console.error("Error running daily quest assignment cron job:", err);
    }
    console.log("Daily quest assignment cron job completed.");

    res.send("Cron job executed");
});

module.exports = router;
