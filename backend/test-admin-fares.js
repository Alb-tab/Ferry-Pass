const BASE = 'http://localhost:8080';

async function run() {
  try {
    // Login
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'operador@ferrypass.com', password: 'senha123' })
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login falhou', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    console.log('Token recebido');

    // Chamar rota admin sem incluir_inactive (deve retornar ativo somente)
    const res = await fetch(`${BASE}/api/admin/fares`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    console.log('GET /api/admin/fares -> status', res.status, 'items:', Array.isArray(data) ? data.length : data);
  } catch (err) {
    console.error('Erro no teste:', err);
  }
}

run();
