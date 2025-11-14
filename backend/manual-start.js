#!/usr/bin/env node

import dotenv from 'dotenv';
dotenv.config();

import { initializeDatabase } from './src/models/database.js';
import express from 'express';
import cors from 'cors';

console.log('🚀 Iniciando servidor manualmente...\n');

const app = express();
const PORT = process.env.PORT || 3000;

console.log(`📌 PORT: ${PORT}`);
console.log(`📌 NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`📌 DB_PATH: ${process.env.DB_PATH}\n`);

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Inicializar banco
console.log('📦 Inicializando banco de dados...');
initializeDatabase();

// Health check
app.get('/api/health', (req, res) => {
  console.log('✓ Health check recebido');
  res.json({ status: 'API running' });
});

// Teste simples
app.get('/test', (req, res) => {
  res.json({ message: 'Teste OK' });
});

// Listener
const server = app.listen(PORT, () => {
  console.log(`\n✅ Servidor iniciado com sucesso!`);
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/api/health`);
  console.log(`🧪 Teste: http://localhost:${PORT}/test\n`);
});

server.on('error', (err) => {
  console.error('\n❌ Erro ao iniciar servidor:');
  console.error(err);
  process.exit(1);
});
