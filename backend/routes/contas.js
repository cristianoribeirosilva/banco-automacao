const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, cl.nome as cliente_nome 
      FROM contas c 
      JOIN clientes cl ON c.cliente_id = cl.id 
      ORDER BY c.created_at DESC
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM contas WHERE cliente_id = ?', [req.params.clienteId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT c.*, cl.nome as cliente_nome 
      FROM contas c 
      JOIN clientes cl ON c.cliente_id = cl.id 
      WHERE c.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Conta não encontrada' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { cliente_id, tipo } = req.body;
  if (!cliente_id) return res.status(400).json({ error: 'Cliente é obrigatório' });
  try {
    const numero = String(Math.floor(Math.random() * 900000) + 100000);
    const agencia = '0001';
    const [result] = await db.query(
      'INSERT INTO contas (cliente_id, numero, agencia, tipo, saldo) VALUES (?, ?, ?, ?, 0.00)',
      [cliente_id, numero, agencia, tipo || 'corrente']
    );
    const [newConta] = await db.query('SELECT * FROM contas WHERE id = ?', [result.insertId]);
    res.status(201).json(newConta[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/depositar', async (req, res) => {
  const { valor } = req.body;
  if (!valor || valor <= 0) return res.status(400).json({ error: 'Valor deve ser maior que zero' });
  try {
    const [existing] = await db.query('SELECT * FROM contas WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Conta não encontrada' });
    await db.query('UPDATE contas SET saldo = saldo + ? WHERE id = ?', [valor, req.params.id]);
    await db.query(
      'INSERT INTO transacoes (conta_origem_id, tipo, valor, descricao) VALUES (?, "deposito", ?, ?)',
      [req.params.id, valor, 'Depósito']
    );
    const [updated] = await db.query('SELECT * FROM contas WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/sacar', async (req, res) => {
  const { valor } = req.body;
  if (!valor || valor <= 0) return res.status(400).json({ error: 'Valor deve ser maior que zero' });
  try {
    const [existing] = await db.query('SELECT * FROM contas WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Conta não encontrada' });
    if (existing[0].saldo < valor) return res.status(400).json({ error: 'Saldo insuficiente' });
    await db.query('UPDATE contas SET saldo = saldo - ? WHERE id = ?', [valor, req.params.id]);
    await db.query(
      'INSERT INTO transacoes (conta_origem_id, tipo, valor, descricao) VALUES (?, "saque", ?, ?)',
      [req.params.id, valor, 'Saque']
    );
    const [updated] = await db.query('SELECT * FROM contas WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/transferir', async (req, res) => {
  const { conta_origem_id, conta_destino_numero, valor } = req.body;
  if (!conta_origem_id || !conta_destino_numero || !valor || valor <= 0) {
    return res.status(400).json({ error: 'Dados incompletos' });
  }
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [origem] = await conn.query('SELECT * FROM contas WHERE id = ? FOR UPDATE', [conta_origem_id]);
    if (origem.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Conta de origem não encontrada' }); }
    if (origem[0].saldo < valor) { await conn.rollback(); return res.status(400).json({ error: 'Saldo insuficiente' }); }
    const [destino] = await conn.query('SELECT * FROM contas WHERE numero = ? FOR UPDATE', [conta_destino_numero]);
    if (destino.length === 0) { await conn.rollback(); return res.status(404).json({ error: 'Conta de destino não encontrada' }); }
    await conn.query('UPDATE contas SET saldo = saldo - ? WHERE id = ?', [valor, conta_origem_id]);
    await conn.query('UPDATE contas SET saldo = saldo + ? WHERE id = ?', [valor, destino[0].id]);
    await conn.query(
      'INSERT INTO transacoes (conta_origem_id, conta_destino_id, tipo, valor, descricao) VALUES (?, ?, "transferencia", ?, ?)',
      [conta_origem_id, destino[0].id, valor, `Transferência para conta ${conta_destino_numero}`]
    );
    await conn.commit();
    const [updated] = await db.query('SELECT * FROM contas WHERE id = ?', [conta_origem_id]);
    res.json(updated[0]);
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;
