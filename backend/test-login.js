#!/usr/bin/env node

import http from 'http';

const data = JSON.stringify({
  email: 'operador@ferrypass.com',
  password: 'senha123'
});

console.log('\n🔐 Testando login...\n');
console.log('Enviando para: http://localhost:3000/api/auth/login');
console.log('Dados:', JSON.parse(data));
console.log('\n');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/login',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}\n`);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    try {
      const response = JSON.parse(body);
      console.log('✅ Resposta recebida:');
      console.log(JSON.stringify(response, null, 2));
      
      if (response.token) {
        console.log('\n✅ LOGIN FUNCIONANDO!');
        console.log('\nToken JWT:');
        console.log(response.token);
        console.log('\nOperador:');
        console.log(response.operator);
      } else if (response.error) {
        console.log('\n❌ ERRO:', response.error);
      }
    } catch (e) {
      console.log('❌ Erro ao parsear resposta:');
      console.log(body);
    }
    process.exit(0);
  });
});

req.on('error', (e) => {
  console.error('❌ Erro de conexão:', e.message);
  console.error('\n⚠️  O backend não está respondendo em http://localhost:3000');
  console.error('\nVerifique se:');
  console.error('1. O backend está rodando: npm run dev');
  console.error('2. A porta 3000 está disponível');
  console.error('3. Não há outros serviços usando a porta 3000\n');
  process.exit(1);
});

req.write(data);
req.end();
