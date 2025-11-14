import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getAsync, runAsync } from '../models/database-pg.js';

const router = express.Router();

// Login - obtém token JWT
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const operator = await getAsync('SELECT * FROM operators WHERE email = $1', [email]);

    if (!operator || !await bcrypt.compare(password, operator.password_hash)) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    const token = jwt.sign(
      { id: operator.id, email: operator.email, role: operator.role || 'operator' },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({ token, operator: { id: operator.id, email: operator.email, name: operator.name, role: operator.role || 'operator' } });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao fazer login' });
  }
});

// Registrar novo operador (apenas admin - será retirado em produção)
router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await runAsync(
      'INSERT INTO operators (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id',
      [email, hashedPassword, name || email]
    );

    res.status(201).json({ message: 'Operador registrado com sucesso', id: result.rows[0].id });
  } catch (error) {
    if (error.message.includes('unique')) {
      return res.status(400).json({ error: 'Email já registrado' });
    }
    console.error(error);
    res.status(500).json({ error: 'Erro ao registrar operador' });
  }
});

export default router;
