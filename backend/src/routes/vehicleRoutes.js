import express from 'express';
import { getAsync, allAsync, runAsync } from '../models/database.js';

const router = express.Router();

// Buscar veículo por placa ou listar todos
router.get('/', async (req, res) => {
  try {
    const { plate } = req.query;

    if (plate) {
      const vehicle = await getAsync('SELECT * FROM vehicles WHERE plate = ?', [plate]);
      return res.json(vehicle || {});
    }

    const vehicles = await allAsync('SELECT * FROM vehicles ORDER BY created_at DESC');
    res.json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar veículos' });
  }
});

// Criar novo veículo
router.post('/', async (req, res) => {
  try {
    const { plate, model, vehicle_type, owner_client_id } = req.body;

    if (!plate || !model || !vehicle_type) {
      return res.status(400).json({ error: 'Placa, modelo e tipo são obrigatórios' });
    }

    const result = await runAsync(
      'INSERT INTO vehicles (plate, model, vehicle_type, owner_client_id) VALUES (?, ?, ?, ?)',
      [plate, model, vehicle_type, owner_client_id || null]
    );

    res.status(201).json({ id: result.id, plate, model, vehicle_type, owner_client_id });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'Placa já cadastrada' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar veículo' });
  }
});

// Buscar tarifa por rota e tipo de veículo
router.get('/fares', async (req, res) => {
  try {
    const { route_id, vehicle_type } = req.query;

    if (!route_id || !vehicle_type) {
      return res.status(400).json({ error: 'route_id e vehicle_type são obrigatórios' });
    }

    const fare = await getAsync(
      'SELECT * FROM fares WHERE route_id = ? AND vehicle_type = ?',
      [route_id, vehicle_type]
    );

    res.json(fare || { amount: 0 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar tarifa' });
  }
});

export default router;
