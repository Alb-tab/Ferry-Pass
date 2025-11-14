import express from 'express';
import { getAsync, allAsync, runAsync } from '../models/database-pg.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Buscar cliente por CPF ou listar todos
router.get('/', async (req, res) => {
  try {
    const { cpf } = req.query;

    if (cpf) {
      const client = await getAsync('SELECT * FROM clients WHERE cpf = $1', [cpf]);
      return res.json(client || {});
    }

    const clients = await allAsync('SELECT * FROM clients ORDER BY created_at DESC');
    res.json(clients);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao buscar clientes' });
  }
});

// Criar novo cliente
router.post('/', async (req, res) => {
  try {
    const { cpf, name, email, phone } = req.body;

    if (!cpf || !name) {
      return res.status(400).json({ error: 'CPF e nome são obrigatórios' });
    }

    const result = await runAsync(
      'INSERT INTO clients (cpf, name, email, phone) VALUES ($1, $2, $3, $4) RETURNING id',
      [cpf, name, email || null, phone || null]
    );

    res.status(201).json({ id: result.rows[0].id, cpf, name, email, phone });
  } catch (error) {
    if (error.message.includes('UNIQUE')) {
      return res.status(400).json({ error: 'CPF já cadastrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar cliente' });
  }
});

// Atualizar cliente
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, phone } = req.body;

    await runAsync(
      'UPDATE clients SET name = $1, email = $2, phone = $3 WHERE id = $4',
      [name, email, phone, id]
    );

    res.json({ message: 'Cliente atualizado com sucesso' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao atualizar cliente' });
  }
});

export default router;
