import express from 'express';
import { allAsync, runAsync } from '../models/database-pg.js';

const router = express.Router();

// Listar todas as rotas
router.get('/', async (req, res) => {
  try {
  const routes = await allAsync('SELECT * FROM routes');
    res.json(routes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar rotas' });
  }
});

// Criar nova rota
router.post('/', async (req, res) => {
  try {
    const { name, origin, destination, duration_minutes } = req.body;

    if (!name || !origin || !destination) {
      return res.status(400).json({ error: 'Nome, origem e destino são obrigatórios' });
    }

    const result = await runAsync(
      'INSERT INTO routes (name, origin, destination, duration_minutes) VALUES ($1, $2, $3, $4) RETURNING id',
      [name, origin, destination, duration_minutes || 0]
    );

    res.status(201).json({ id: result.rows[0].id, name, origin, destination, duration_minutes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar rota' });
  }
});

export default router;
