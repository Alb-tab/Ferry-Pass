import http from 'http';

const req = http.get('http://localhost:3000/ping', (res) => {
  console.log('✅ Conectado! Status:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => console.log('Resposta:', data));
  process.exit(0);
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});

setTimeout(() => {
  console.error('⏱️ Timeout após 5 segundos');
  process.exit(1);
}, 5000);
