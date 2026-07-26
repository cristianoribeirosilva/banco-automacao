require('dotenv').config();
const express = require('express');
const cors = require('cors');
const clientesRouter = require('./routes/clientes');
const contasRouter = require('./routes/contas');
const transacoesRouter = require('./routes/transacoes');
const chavesPixRouter = require('./routes/chaves_pix');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/clientes', clientesRouter);
app.use('/api/contas', contasRouter);
app.use('/api/transacoes', transacoesRouter);
app.use('/api/chaves-pix', chavesPixRouter);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
