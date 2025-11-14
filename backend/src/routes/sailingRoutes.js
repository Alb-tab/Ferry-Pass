import express from 'express';
import { allAsync, runAsync, getAsync } from '../models/database-pg.js';

const router = express.Router();

// Listar viagens (sailings)
router.get('/', async (req, res) => {
  try {
    const { route_id } = req.query;

    let sql = `
      SELECT 
        s.id, 
        s.route_id, 
        s.departure_time as departure,
        s.available_seats,
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
      sql += ' WHERE s.route_id = $1';
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

    // Inserir usando a estrutura atual da tabela: departure_time, arrival_time, available_seats, vehicle_id (pode ser nulo)
    const arrival = req.body.arrival_time || new Date(new Date(departure).getTime() + 60 * 60 * 1000).toISOString();
    const available = req.body.available_seats || 100;
    const vehicle_id = req.body.vehicle_id || null;

    const result = await runAsync(
      'INSERT INTO sailings (route_id, vehicle_id, departure_time, arrival_time, available_seats) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [route_id, vehicle_id, departure, arrival, available]
    );

    res.status(201).json({ id: result.rows[0].id, route_id, departure, arrival_time: arrival, available_seats: available });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar viagem' });
  }
});

export default router;
