#!/usr/bin/env node

import express from 'express';

const app = express();
const PORT = 3000;

app.use(express.json());

// Teste 1: Ping simples
app.get('/ping', (req, res) => {
  res.json({ pong: true });
});

// Teste 2: Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'API running' });
});

// Teste 3: Echo
app.post('/echo', express.json(), (req, res) => {
  res.json(req.body);
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server listening on http://0.0.0.0:${PORT}`);
  console.log(`✅ Server listening on http://localhost:${PORT}`);
  console.log(`✅ Server listening on http://127.0.0.1:${PORT}`);
  console.log(`🔗 Try: curl http://localhost:${PORT}/ping`);
});

server.on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught exception:', err);
  process.exit(1);
});
