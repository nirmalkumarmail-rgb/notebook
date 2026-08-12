const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');

router.use(auth);

const parse = (row) =>
  row ? { ...row, tags: JSON.parse(row.tags || '[]'), pinned: !!row.pinned } : null;

router.get('/', async (req, res) => {
  try {
    const rows = await db.all(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY pinned DESC, updated_at DESC',
      req.user.id
    );
    res.json(rows.map(parse));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const row = await db.get(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      req.params.id, req.user.id
    );
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(parse(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title = '', content = '', tags = [] } = req.body;
    const { lastInsertRowid } = await db.run(
      'INSERT INTO notes (user_id, title, content, tags) VALUES (?, ?, ?, ?)',
      req.user.id, title, content, JSON.stringify(tags)
    );
    const row = await db.get('SELECT * FROM notes WHERE id = ?', lastInsertRowid);
    res.status(201).json(parse(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { title = '', content = '', tags = [] } = req.body;
    const now = new Date().toISOString();
    await db.run(
      'UPDATE notes SET title = ?, content = ?, tags = ?, updated_at = ? WHERE id = ? AND user_id = ?',
      title, content, JSON.stringify(tags), now, req.params.id, req.user.id
    );
    const row = await db.get(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      req.params.id, req.user.id
    );
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(parse(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.patch('/:id/pin', async (req, res) => {
  try {
    const pinned = req.body.pinned ? 1 : 0;
    await db.run(
      'UPDATE notes SET pinned = ? WHERE id = ? AND user_id = ?',
      pinned, req.params.id, req.user.id
    );
    const row = await db.get(
      'SELECT * FROM notes WHERE id = ? AND user_id = ?',
      req.params.id, req.user.id
    );
    if (!row) return res.status(404).json({ error: 'Not found' });
    res.json(parse(row));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await db.run(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      req.params.id, req.user.id
    );
    res.json({});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
