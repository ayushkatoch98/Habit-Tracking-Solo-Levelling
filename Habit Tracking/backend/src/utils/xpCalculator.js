const calculateXPForLevel = (level) => {
  return Math.floor(100 * Math.pow(1.5, level - 1));
};

const calculateLevel = (totalXP) => {
  let level = 1;
  let xpNeeded = 0;
  
  while (xpNeeded <= totalXP) {
    xpNeeded += calculateXPForLevel(level);
    if (xpNeeded <= totalXP) {
      level++;
    }
  }
  
  return level;
};

const addXP = async (client, userId, xpAmount) => {
  const userResult = await client.query(
    "SELECT xp, level FROM users WHERE id = $1 FOR UPDATE",
    [userId]
  );
  
  if (userResult.rows.length === 0) {
    throw new Error("User not found");
  }
  
  const currentXP = userResult.rows[0].xp;
  const currentLevel = userResult.rows[0].level;
  const newXP = currentXP + xpAmount;
  const newLevel = calculateLevel(newXP);
  
  const levelUp = newLevel > currentLevel;
  
  await client.query(
    "UPDATE users SET xp = $1, level = $2 WHERE id = $3",
    [newXP, newLevel, userId]
  );
  
  return {
    xp: newXP,
    level: newLevel,
    levelUp,
    xpGained: xpAmount
  };
};

module.exports = {
  addXP,
  calculateLevel,
  calculateXPForLevel
};
