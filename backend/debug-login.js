#!/usr/bin/env node

import http from 'http';

console.log('\n🔐 Testando login via http.request...\n');

const data = JSON.stringify({
  email: 'operador@ferrypass.com',
  password: 'senha123'
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/health',  // Testar health primeiro
  method: 'GET',
  headers: {}
};

console.log('1️⃣ Testando /api/health primeiro...\n');

const req = http.request(options, (res) => {
  console.log(`✅ Status: ${res.statusCode}`);

  let body = '';
  res.on('data', (chunk) => {
    body += chunk;
  });

  res.on('end', () => {
    console.log('Resposta:', body);
    
    // Agora testar login
    console.log('\n2️⃣ Agora testando /api/auth/login...\n');
    
    const loginOptions = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };
    
    const loginReq = http.request(loginOptions, (res2) => {
      console.log(`Status: ${res2.statusCode}\n`);
      
      let body2 = '';
      res2.on('data', (chunk) => {
        body2 += chunk;
      });
      
      res2.on('end', () => {
        try {
          const response = JSON.parse(body2);
          console.log('📦 Resposta:');
          console.log(JSON.stringify(response, null, 2));
          
          if (response.token) {
            console.log('\n✅ ✅ ✅ LOGIN FUNCIONANDO! ✅ ✅ ✅');
          } else if (response.error) {
            console.log('\n❌ Erro:', response.error);
          }
        } catch (e) {
          console.log('Resposta bruta:', body2);
        }
        process.exit(0);
      });
    });
    
    loginReq.on('error', (e) => {
      console.error('❌ Erro no login:', e.message);
      process.exit(1);
    });
    
    loginReq.write(data);
    loginReq.end();
  });
});

req.on('error', (e) => {
  console.error('❌ Erro ao conectar:', e.code || e.message || String(e));
  console.error('Detalhes:', JSON.stringify({
    code: e.code,
    errno: e.errno,
    syscall: e.syscall,
    message: e.message
  }, null, 2));
  process.exit(1);
});

req.end();
