import http from 'http';

console.log('Testando porta 8000...\n');

const req = http.get('http://127.0.0.1:8000/api/health', (res) => {
  console.log(`✅ CONECTADO! Status: ${res.statusCode}`);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log(`Resposta: ${data}`);
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.code);
  process.exit(1);
});

req.end();
