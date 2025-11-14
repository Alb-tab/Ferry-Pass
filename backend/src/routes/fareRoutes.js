import express from 'express';
import { allAsync } from '../models/database-pg.js';

const router = express.Router();

// GET /api/fares  - list fare items, optional query: ?route_id=1&vehicle_type=moto&category=...
router.get('/', async (req, res) => {
  try {
    const { route_id, vehicle_type, category, loaded_state } = req.query;
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
    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }
    if (loaded_state) {
      params.push(loaded_state);
      conditions.push(`loaded_state = $${params.length}`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const rows = await allAsync(`SELECT * FROM fare_items ${where} ORDER BY id`, params);
    res.json(rows);
  } catch (err) {
    console.error('Erro GET /api/fares', err);
    res.status(500).json({ error: 'Erro ao buscar tarifas' });
  }
});

export default router;
