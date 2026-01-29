export const QUEST_STATUS = {
    FAILED: "FAILED",
    PENDING: "PENDING",
    COMPLETED: "COMPLETED"
}

export const QUEST_TYPE = {
    DAILY_QUEST: "DAILY_QUEST",
    PENALTY: "PENALTY",
    WEEKLY_QUEST: "WEEKLY_QUEST"
}

export const QUEST_TO_DURATION_HOURS = {
    DAILY_QUEST: 24,
    PENALTY: 24,
    WEEKLY_QUEST: 24 * 7
}

export function xpRequiredForLevel(level) {
    return Math.floor(100 * Math.pow(level, 1.5));
}

export async function applyXpDelta(userId, userEmail, xpDelta, client) {
    console.log(`Applying XP delta of ${xpDelta} to user ${userEmail}`);
    await client.query('BEGIN');

    try {
        // Lock user row
        const res = await client.query(
            `SELECT level, xp FROM users WHERE id = $1 FOR UPDATE`,
            [userId]
        );

        if (res.rows.length === 0) {
            throw new Error('User not found');
        }

        let { level, xp } = res.rows[0];

        // Apply XP delta
        xp += xpDelta;

        // ⬆️ LEVEL UP
        while (xp >= xpRequiredForLevel(level)) {
            xp -= xpRequiredForLevel(level);
            level += 1;
        }

        // ⬇️ LEVEL DOWN
        while (xp < 0 && level > 1) {
            level -= 1;
            xp += xpRequiredForLevel(level);
        }

        // Clamp floor (no negative XP at level 1)
        if (level === 1 && xp < 0) {
            xp = 0;
        }

        // Persist
        await client.query(
            `UPDATE users SET level = $1, xp = $2 WHERE id = $3`,
            [level, xp, userId]
        );

        await client.query('COMMIT');

        return {
            level,
            xp,
            xpDelta
        };

    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    }
}