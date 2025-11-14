const BASE = 'http://localhost:8080';

async function run() {
  try {
    // Login como admin
    const loginRes = await fetch(`${BASE}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@ferrypass.com', password: 'admin123' })
    });
    const loginJson = await loginRes.json();
    if (!loginRes.ok) {
      console.error('Login admin falhou', loginJson);
      process.exit(1);
    }
    const token = loginJson.token;
    console.log('Token admin recebido');

    // Chamar rota admin
    const res = await fetch(`${BASE}/api/admin/fares`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    console.log('GET /api/admin/fares (admin) -> status', res.status, 'items:', Array.isArray(data) ? data.length : data);
  } catch (err) {
    console.error('Erro no teste admin:', err);
  }
}

run();
