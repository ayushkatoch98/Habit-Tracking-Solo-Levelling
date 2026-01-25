const cron = require("node-cron");
const pool = require("../config/db");

cron.schedule("0 9 * * *", async () => {
  console.log(" Daily quest cron started");

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    //  Mark old pending quests as FAILED
    const failed = await client.query(`
      UPDATE quest_logs
      SET status = 'FAILED'
      WHERE status = 'PENDING'
      AND created_at < CURRENT_DATE
      RETURNING user_id
    `);

    //  Add penalty quest for failed users
    if (failed.rowCount > 0) {
      await client.query(`
        INSERT INTO quest_logs (user_id, quest_id)
        SELECT DISTINCT f.user_id, q.id
        FROM (SELECT unnest($1::uuid[]) AS user_id) f
        JOIN quests q ON q.quest_type = 'PENALTY'
        ON CONFLICT DO NOTHING
      `, [failed.rows.map(r => r.user_id)]);
    }

    //  Add daily quests to all users
    await client.query(`
      INSERT INTO quest_logs (user_id, quest_id)
      SELECT u.id, q.id
      FROM users u
      CROSS JOIN quests q
      WHERE q.quest_type = 'DAILY'
      ON CONFLICT DO NOTHING
    `);

    await client.query("COMMIT");
    console.log(" Daily quest cron completed");

  } catch (err) {
    await client.query("ROLLBACK");
    console.error(" Cron error:", err.message);
  } finally {
    client.release();
  }
});
