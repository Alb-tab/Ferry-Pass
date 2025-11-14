import express from 'express';
import { verifyToken, requireRole } from '../middleware/auth.js';
import { allAsync, getAsync, runAsync } from '../models/database-pg.js';

const router = express.Router();

// Middleware: permite operadores e admins autenticados
router.use(verifyToken);
router.use(requireRole(['operator', 'admin']));

// Listar tarifas (opcional: ?route_id=, ?vehicle_type=, ?include_inactive=true)
router.get('/', async (req, res) => {
  try {
    const { route_id, vehicle_type, include_inactive } = req.query;
    const conditions = [];
    const params = [];

    if (route_id) {
      params.push(route_id);
      conditions.push(`route_id = $${params.length}`);
    }
    if (vehicle_type) {
      params.push(vehicle_type);
      conditions.push(`vehicle_type = $${params.length}`);
    }

    if (!include_inactive || include_inactive === 'false') {
      conditions.push(`active = true`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await allAsync(`SELECT * FROM fare_items ${where} ORDER BY id`, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao listar tarifas' });
  }
});

// Criar tarifa
router.post('/', async (req, res) => {
  try {
    const { route_id = null, category = null, vehicle_type = null, loaded_state = null, amount } = req.body;
    if (amount == null) return res.status(400).json({ error: 'amount é obrigatório' });

    const result = await runAsync(
      `INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount, active) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [route_id, category, vehicle_type, loaded_state, amount, true]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao criar tarifa' });
  }
});

// Atualizar tarifa (parcial / total)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const fields = [];
    const params = [];
    const allowed = ['route_id','category','vehicle_type','loaded_state','amount','active'];
    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(req.body, key)) {
        params.push(req.body[key]);
        fields.push(`${key} = $${params.length}`);
      }
    }
    if (fields.length === 0) return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    params.push(id);
    const q = `UPDATE fare_items SET ${fields.join(', ')} WHERE id = $${params.length} RETURNING *`;
    const result = await runAsync(q, params);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar tarifa' });
  }
});

// Soft-delete / ativar (PATCH)
router.patch('/:id/active', async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;
    if (typeof active !== 'boolean') return res.status(400).json({ error: 'active deve ser booleano' });

    const result = await runAsync(`UPDATE fare_items SET active = $1 WHERE id = $2 RETURNING *`, [active, id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao alterar estado da tarifa' });
  }
});

// DELETE físico não implementado (usar PATCH para desativar)
router.delete('/:id', (req, res) => {
  res.status(405).json({ error: 'DELETE não suportado. Use PATCH /:id/active para soft-delete.' });
});

export default router;
