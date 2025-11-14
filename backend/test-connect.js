import http from 'http';

// Tentar a cada segundo
let tentativas = 0;
const maxTentativas = 5;

function testar() {
  tentativas++;
  console.log(`\n🔄 Tentativa ${tentativas}/${maxTentativas}...`);
  
  const req = http.request({
    hostname: '127.0.0.1',
    port: 3000,
    path: '/api/health',
    method: 'GET'
  }, (res) => {
    console.log(`✅ CONECTADO! Status: ${res.statusCode}`);
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      console.log(`Resposta: ${data}`);
      process.exit(0);
    });
  });

  req.on('error', (e) => {
    console.log(`❌ Erro: ${e.code}`);
    if (tentativas < maxTentativas) {
      setTimeout(testar, 1000);
    } else {
      console.error('\n❌ Não conseguiu conectar após 5 tentativas');
      process.exit(1);
    }
  });

  req.setTimeout(2000, () => {
    req.destroy();
    console.log('❌ Timeout');
    if (tentativas < maxTentativas) {
      setTimeout(testar, 1000);
    }
  });

  req.end();
}

testar();
