#!/usr/bin/env node

import http from 'http';

const data = JSON.stringify({
  email: 'operador@ferrypass.com',
  password: 'senha123',
  name: 'Operador Padrão'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`\nStatus: ${res.statusCode}\n`);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Resposta:');
    console.log(JSON.parse(body));
    console.log('\n✅ Operador criado com sucesso!');
    console.log('\n📌 Agora você pode fazer login com:');
    console.log('   Email: operador@ferrypass.com');
    console.log('   Senha: senha123\n');
  });
});

req.on('error', (e) => {
  console.error(`❌ Erro: ${e.message}`);
  console.error('\nVerifique se o servidor está rodando em http://localhost:3000');
  process.exit(1);
});

req.write(data);
req.end();
