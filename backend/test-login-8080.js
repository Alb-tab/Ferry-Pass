#!/usr/bin/env node

import http from 'http';

console.log('\n🔐 Testando login no servidor...\n');

const data = JSON.stringify({
  email: 'operador@ferrypass.com',
  password: 'senha123'
});

const options = {
  hostname: 'localhost',
  port: 8080,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}\n`);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      console.log('📦 Resposta:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.token) {
        console.log('\n✅ ✅ ✅ LOGIN FUNCIONANDO! ✅ ✅ ✅');
        console.log(`Token: ${response.token.substring(0, 50)}...`);
      }
    } catch (e) {
      console.log('Resposta:', body);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro:', e.message);
  process.exit(1);
});

req.write(data);
req.end();
