const express = require('express');
const db = require('../db');

const router = express.Router();

const isPg = !!process.env.DATABASE_URL;

// Protect with ADMIN_KEY env var
router.use((req, res, next) => {
  const key = process.env.ADMIN_KEY;
  if (!key) return res.status(503).json({ error: 'ADMIN_KEY not configured on server' });
  const provided = req.query.key || req.headers['x-admin-key'];
  if (provided !== key) return res.status(401).json({ error: 'Invalid admin key' });
  next();
});

router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalNotes,
      activeUsers,
      newUsersToday,
      newUsersWeek,
      usersPerDay,
    ] = await Promise.all([
      db.get('SELECT COUNT(*) AS count FROM users'),
      db.get('SELECT COUNT(*) AS count FROM notes'),

      db.get(
        isPg
          ? "SELECT COUNT(DISTINCT user_id) AS count FROM notes WHERE updated_at > NOW() - INTERVAL '7 days'"
          : "SELECT COUNT(DISTINCT user_id) AS count FROM notes WHERE updated_at > datetime('now', '-7 days')"
      ),

      db.get(
        isPg
          ? "SELECT COUNT(*) AS count FROM users WHERE created_at > NOW() - INTERVAL '1 day'"
          : "SELECT COUNT(*) AS count FROM users WHERE created_at > datetime('now', '-1 day')"
      ),

      db.get(
        isPg
          ? "SELECT COUNT(*) AS count FROM users WHERE created_at > NOW() - INTERVAL '7 days'"
          : "SELECT COUNT(*) AS count FROM users WHERE created_at > datetime('now', '-7 days')"
      ),

      db.all(
        isPg
          ? "SELECT TO_CHAR(created_at::date, 'YYYY-MM-DD') AS day, COUNT(*) AS count FROM users WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day DESC"
          : "SELECT strftime('%Y-%m-%d', created_at) AS day, COUNT(*) AS count FROM users WHERE created_at > datetime('now', '-30 days') GROUP BY day ORDER BY day DESC"
      ),
    ]);

    res.json({
      users: {
        total: Number(totalUsers?.count ?? 0),
        today: Number(newUsersToday?.count ?? 0),
        thisWeek: Number(newUsersWeek?.count ?? 0),
        activeThisWeek: Number(activeUsers?.count ?? 0),
        perDay: usersPerDay.map((r) => ({ day: r.day, count: Number(r.count) })),
      },
      notes: {
        total: Number(totalNotes?.count ?? 0),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
