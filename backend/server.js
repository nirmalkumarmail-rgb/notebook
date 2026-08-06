const express = require('express');
const cors = require('cors');

require('./db');
const authRouter = require('./routes/auth');
const notesRouter = require('./routes/notes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
