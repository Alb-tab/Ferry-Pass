import express from 'express';

const app = express();
const PORT = 8000;

app.use(express.json());

app.get('/ping', (req, res) => {
  console.log('📍 Recebeu ping!');
  res.json({ pong: true });
});

app.get('/api/health', (req, res) => {
  console.log('📍 Recebeu health check!');
  res.json({ status: 'OK' });
});

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Servidor REALMENTE escutando em 0.0.0.0:${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ ERRO CRÍTICO:', err);
  process.exit(1);
});

// Manter vivo
process.on('SIGINT', () => {
  console.log('\n👋 Encerrando...');
  process.exit(0);
});
