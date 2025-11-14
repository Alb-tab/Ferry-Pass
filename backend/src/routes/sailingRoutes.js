import express from 'express';
import { allAsync, runAsync, getAsync } from '../models/database.js';

const router = express.Router();

// Listar viagens (sailings)
router.get('/', async (req, res) => {
  try {
    const { route_id } = req.query;

    let sql = `
      SELECT 
        s.id, 
        s.route_id, 
        s.departure, 
        s.capacity_passengers, 
        s.capacity_vehicles,
        r.name as route_name,
        r.origin,
        r.destination,
        (SELECT COUNT(*) FROM tickets WHERE sailing_id = s.id AND vehicle_id IS NULL) as passengers_booked,
        (SELECT COUNT(*) FROM tickets WHERE sailing_id = s.id AND vehicle_id IS NOT NULL) as vehicles_booked
      FROM sailings s
      JOIN routes r ON s.route_id = r.id
    `;

    let params = [];

    if (route_id) {
      sql += ' WHERE s.route_id = ?';
      params = [route_id];
    }

    sql += ' ORDER BY s.departure DESC';

    const sailings = await allAsync(sql, params);
    res.json(sailings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar viagens' });
  }
});

// Criar nova viagem
router.post('/', async (req, res) => {
  try {
    const { route_id, departure, capacity_passengers, capacity_vehicles } = req.body;

    if (!route_id || !departure) {
      return res.status(400).json({ error: 'route_id e departure são obrigatórios' });
    }

    const result = await runAsync(
      'INSERT INTO sailings (route_id, departure, capacity_passengers, capacity_vehicles) VALUES (?, ?, ?, ?)',
      [route_id, departure, capacity_passengers || 100, capacity_vehicles || 50]
    );

    res.status(201).json({ id: result.id, route_id, departure, capacity_passengers, capacity_vehicles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar viagem' });
  }
});

export default router;
