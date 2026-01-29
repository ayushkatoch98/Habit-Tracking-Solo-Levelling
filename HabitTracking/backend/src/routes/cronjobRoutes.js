const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const { QUEST_STATUS, QUEST_TYPE, applyXpDelta } = require("../constant");


async function assignNewQuestToUser(userId, userEmail, quest_type, client) {
    console.log("Assigning new quest of type", quest_type, "to user", userEmail);
    const dailyQuestResult = await client.query(
        `SELECT id, quest_duration FROM quests WHERE quest_type = $1 ORDER BY RANDOM()`,
        [quest_type]
    );

    if (dailyQuestResult.rows.length > 0) {

        for (const dq of dailyQuestResult.rows) {
            const dailyQuestId = dq.id;
            const dailyQuestDuration = dq.quest_duration;

            await client.query('BEGIN'); // Start a new transaction
            try {
                await client.query(
                    `INSERT INTO quest_logs (user_id, quest_id, status, assigned_at, complete_by) 
                                 VALUES ($1, $2, $3, NOW(), NOW() + ($4 || ' minutes')::interval)`,
                    [userId, dailyQuestId, QUEST_STATUS.PENDING, dailyQuestDuration]
                );
            } catch (err) {
                // likely unique constraint violation - user already has a pending quest of this type
                await client.query('ROLLBACK'); // Rollback the current transaction
                if (err.code === '23505') {
                    console.log(`User ${userEmail} already has a pending quest of type ${quest_type}. Skipping assignment.`);
                    continue;
                }
                else {
                    console.log("ERR", err)
                    throw err;
                }
            } finally {
                await client.query('COMMIT'); // Commit the transaction
            }
        }
        console.log(`Assigned new daily quest to user ${userEmail}.`);
    }
}

async function assignPenaltyQuestToUser(userId, userEmail, client) {
    console.log("Assigning penalty quest to user", userEmail);
    const penaltyQuestResult = await client.query(
        `SELECT id, quest_duration FROM quests WHERE quest_type = $1 ORDER BY RANDOM() LIMIT 1`,
        [QUEST_TYPE.PENALTY]
    );

    if (penaltyQuestResult.rows.length > 0) {
        const penaltyQuestId = penaltyQuestResult.rows[0].id;
        const penaltyQuestDuration = penaltyQuestResult.rows[0].quest_duration;
        await client.query('BEGIN'); // Start a new transaction
        try{
            await client.query(
                `INSERT INTO quest_logs (user_id, quest_id, status, assigned_at, complete_by) 
                                 VALUES ($1, $2, $3, NOW(), NOW() + ($4 || ' minutes')::interval)`,
                [userId, penaltyQuestId, QUEST_STATUS.PENDING, penaltyQuestDuration]
            );
            console.log(`Assigned penalty quest to user ${userEmail} for failing daily quest.`);
        }catch(err){
            await client.query('ROLLBACK');
            console.log("Failed to assign penalty quest to user", err);
        }
        finally {
            await client.query('COMMIT');
        }
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
                // Check if the user has a pending daily quest from the previous day
                const { assignPenalty, totalFailedXp } = await markPendingQuestAsFailed(userId, userEmail, QUEST_TYPE.DAILY_QUEST, client);
                const { assignPenalty: assignPenalty2, totalFailedXp: totalFailedXp2 } = await markPendingQuestAsFailed(userId, userEmail, QUEST_TYPE.PENALTY, client);
                // assign penalty quest if they failed to complete previous day's daily quest
                if (assignPenalty || assignPenalty2) {
                    // Subtract failed XP
                    const finalTotalFailedXp = totalFailedXp + totalFailedXp2;
                    if (finalTotalFailedXp > 0) {
                        await applyXpDelta(userId, userEmail, -finalTotalFailedXp, client);
                    }
                    await assignPenaltyQuestToUser(userId, userEmail, client);
                }
                // Assign new daily quest
                await assignNewQuestToUser(userId, userEmail, QUEST_TYPE.DAILY_QUEST, client);

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