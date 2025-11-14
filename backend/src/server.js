import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import { initializeDatabase } from './models/database-pg.js';
import authRoutes from './routes/authRoutes.js';
import clientRoutes from './routes/clientRoutes.js';
import vehicleRoutes from './routes/vehicleRoutes.js';
import routeRoutes from './routes/routeRoutes.js';
import sailingRoutes from './routes/sailingRoutes.js';
import ticketRoutes from './routes/ticketRoutes.js';
import fareRoutes from './routes/fareRoutes.js';
import adminFareRoutes from './routes/adminFareRoutes.js';

const app = express();
const PORT = process.env.PORT || 8080;

console.log('🔍 PORT do arquivo .env:', process.env.PORT);
console.log('🔍 PORT final:', PORT);

async function startServer() {
  // Middleware
  app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
  }));
  app.use(express.json());

  // Inicializar banco de dados
  await initializeDatabase();

  // Rotas
  app.use('/api/auth', authRoutes);
  app.use('/api/clients', clientRoutes);
  app.use('/api/vehicles', vehicleRoutes);
  app.use('/api/routes', routeRoutes);
  app.use('/api/sailings', sailingRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/fares', fareRoutes);
  // Rotas administrativas (apenas operadores autenticados)
  app.use('/api/admin/fares', adminFareRoutes);

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({ status: 'API running' });
  });

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n✓ FerryPass Backend rodando em http://localhost:${PORT}`);
    console.log(`✓ API Health: http://localhost:${PORT}/api/health`);
    console.log(`✓ Servidor escutando em 0.0.0.0:${PORT}\n`);
  });
  
  server.on('error', (err) => {
    console.error('❌ Erro no servidor:', err);
  });
}

startServer().catch((err) => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});
