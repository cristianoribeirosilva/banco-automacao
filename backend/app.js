require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clientesRouter = require('./routes/clientes');
const contasRouter = require('./routes/contas');
const transacoesRouter = require('./routes/transacoes');
const chavesPixRouter = require('./routes/chaves_pix');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRouter);
app.use('/api/contas', contasRouter);
app.use('/api/transacoes', transacoesRouter);
app.use('/api/chaves-pix', chavesPixRouter);

const db = require('./db');

app.get('/api/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(503).json({ status: 'error', db: 'disconnected', error: err.message, timestamp: new Date().toISOString() });
  }
});

module.exports = app;
