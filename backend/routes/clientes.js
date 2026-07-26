const express = require('express');
const router = express.Router();
const db = require('../db');

router.post('/login', async (req, res) => {
  console.log('Login attempt:', { cpf: req.body.cpf, hasSenha: !!req.body.senha });
  const { cpf, senha } = req.body;
  if (!cpf || !senha) return res.status(400).json({ error: 'CPF e senha são obrigatórios' });
  try {
    console.log('Executing query...');
    const [rows] = await db.query('SELECT id, nome, cpf, email, telefone, endereco FROM clientes WHERE cpf = ? AND senha = ?', [cpf, senha]);
    console.log('Query result:', rows.length, 'rows');
    if (rows.length === 0) return res.status(401).json({ error: 'Usuário/Senha inválidos' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, cpf, email, telefone, endereco, created_at FROM clientes ORDER BY created_at DESC');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT id, nome, cpf, email, telefone, endereco, created_at FROM clientes WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { nome, cpf, email, telefone, endereco, senha } = req.body;
  if (!nome || !cpf || !email || !senha) return res.status(400).json({ error: 'Nome, CPF, email e senha são obrigatórios' });
  try {
    const [result] = await db.query(
      'INSERT INTO clientes (nome, cpf, email, telefone, endereco, senha) VALUES (?, ?, ?, ?, ?, ?)',
      [nome, cpf, email, telefone || null, endereco || null, senha]
    );
    const [newClient] = await db.query('SELECT id, nome, cpf, email, telefone, endereco FROM clientes WHERE id = ?', [result.insertId]);
    res.status(201).json(newClient[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'CPF já cadastrado' });
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  const { nome, email, telefone, endereco, senha } = req.body;
  try {
    const [existing] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    if (senha) {
      await db.query(
        'UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ?, senha = ? WHERE id = ?',
        [nome || existing[0].nome, email || existing[0].email, telefone || existing[0].telefone, endereco || existing[0].endereco, senha, req.params.id]
      );
    } else {
      await db.query(
        'UPDATE clientes SET nome = ?, email = ?, telefone = ?, endereco = ? WHERE id = ?',
        [nome || existing[0].nome, email || existing[0].email, telefone || existing[0].telefone, endereco || existing[0].endereco, req.params.id]
      );
    }
    const [updated] = await db.query('SELECT id, nome, cpf, email, telefone, endereco FROM clientes WHERE id = ?', [req.params.id]);
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM clientes WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Cliente não encontrado' });
    await db.query('DELETE FROM clientes WHERE id = ?', [req.params.id]);
    res.json({ message: 'Cliente excluído com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
