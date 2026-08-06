const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

const parse = (row) =>
  row ? { ...row, tags: JSON.parse(row.tags || '[]') } : null;

router.get('/', (req, res) => {
  try {
    const rows = db
      .prepare('SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC')
      .all(req.user.id);
    res.json(rows.map(parse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const row = db
      .prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(parse(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const { title = '', content = '', tags = [] } = req.body;
    const { lastInsertRowid } = db
      .prepare('INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)')
      .run(req.user.id, title, content, JSON.stringify(tags));
    const row = db.prepare('SELECT * FROM notes WHERE id = ?').get(lastInsertRowid);
    res.status(201).json(parse(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { title = '', content = '', tags = [] } = req.body;
    db.prepare(
      `UPDATE notes SET title = ?, content = ?, tags = ?,
       updated_at = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
       WHERE id = ? AND user_id = ?`
    ).run(title, content, JSON.stringify(tags), req.params.id, req.user.id);
    const row = db.prepare('SELECT * FROM notes WHERE id = ? AND user_id = ?')
      .get(req.params.id, req.user.id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(parse(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    db.prepare('DELETE FROM notes WHERE id = ? AND user_id = ?')
      .run(req.params.id, req.user.id);
    res.json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
