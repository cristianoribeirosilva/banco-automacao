const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/conta/:contaId', async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT t.*, 
        co.numero as conta_origem_numero,
        cd.numero as conta_destino_numero
      FROM transacoes t
      LEFT JOIN contas co ON t.conta_origem_id = co.id
      LEFT JOIN contas cd ON t.conta_destino_id = cd.id
      WHERE t.conta_origem_id = ? OR t.conta_destino_id = ?
      ORDER BY t.created_at DESC
      LIMIT 50
    `, [req.params.contaId, req.params.contaId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
