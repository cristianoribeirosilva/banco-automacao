const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/buscar', async (req, res) => {
  const { chave } = req.query;
  if (!chave) return res.status(400).json({ error: 'Chave é obrigatória' });
  try {
    const [rows] = await db.query(
      `SELECT cp.*, c.nome as cliente_nome 
       FROM chaves_pix cp 
       JOIN clientes c ON cp.cliente_id = c.id 
       WHERE cp.chave = ?`,
      [chave]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/cliente/:clienteId', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM chaves_pix WHERE cliente_id = ? ORDER BY created_at DESC', [req.params.clienteId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  const { cliente_id, chave, tipo } = req.body;
  if (!cliente_id || !chave || !tipo) return res.status(400).json({ error: 'Cliente, chave e tipo são obrigatórios' });
  try {
    const [result] = await db.query(
      'INSERT INTO chaves_pix (cliente_id, chave, tipo) VALUES (?, ?, ?)',
      [cliente_id, chave, tipo]
    );
    const [newKey] = await db.query('SELECT * FROM chaves_pix WHERE id = ?', [result.insertId]);
    res.status(201).json(newKey[0]);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: 'Chave já cadastrada' });
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const [existing] = await db.query('SELECT * FROM chaves_pix WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return res.status(404).json({ error: 'Chave não encontrada' });
    await db.query('DELETE FROM chaves_pix WHERE id = ?', [req.params.id]);
    res.json({ message: 'Chave excluída com sucesso' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
