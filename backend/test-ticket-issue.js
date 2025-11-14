import { runAsync, getAsync, initializeDatabase } from './src/models/database-pg.js';

const BASE = 'http://localhost:8080';

async function ensureData() {
  await initializeDatabase();

  // Garantir rota
  let route = await getAsync('SELECT * FROM routes LIMIT 1');
  if (!route) {
    const r = await runAsync('INSERT INTO routes (name, origin, destination, duration_minutes) VALUES ($1,$2,$3,$4) RETURNING id', ['Teste Rota','A','B',60]);
    route = { id: r.rows[0].id };
  }

  // Garantir um veículo que servirá como 'barco' para sailings
  let boat = await getAsync("SELECT * FROM vehicles WHERE plate = $1", ['BOAT-1']);
  if (!boat) {
    const v = await runAsync('INSERT INTO vehicles (plate, model, capacity) VALUES ($1,$2,$3) RETURNING id, plate, model', ['BOAT-1','FERRY',500]);
    boat = v.rows[0];
  }

  // Garantir sailing
  let sailing = await getAsync('SELECT * FROM sailings WHERE route_id = $1 LIMIT 1', [route.id]);
  if (!sailing) {
    const dep = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const arr = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
    const s = await runAsync('INSERT INTO sailings (route_id, vehicle_id, departure_time, arrival_time, available_seats) VALUES ($1,$2,$3,$4,$5) RETURNING id', [route.id, boat.id, dep, arr, 400]);
    sailing = { id: s.rows[0].id };
  }

  // Garantir client
  let client = await getAsync("SELECT * FROM clients WHERE cpf = $1", ['00000000000']);
  if (!client) {
    const c = await runAsync('INSERT INTO clients (cpf, name, email, phone) VALUES ($1,$2,$3,$4) RETURNING id', ['00000000000','Cliente Teste','cliente@test.com','+5511999999999']);
    client = { id: c.rows[0].id, email: 'cliente@test.com', name: 'Cliente Teste' };
  }

  // Garantir fare_item passageiro com valor > 0 (evita tarifas gratuitas no seed)
  let fare = await getAsync('SELECT * FROM fare_items WHERE route_id = $1 AND vehicle_type = $2 AND active = true AND amount > 0 ORDER BY id LIMIT 1', [route.id, 'passageiro']);
  if (!fare) {
    const f = await runAsync('INSERT INTO fare_items (route_id, category, vehicle_type, amount, active) VALUES ($1,$2,$3,$4,$5) RETURNING id, amount', [route.id, 'teste_passageiro', 'passageiro', 10.00, true]);
    fare = { id: f.rows[0].id, amount: f.rows[0].amount };
  }

  return { route, boat, sailing, client, fare };
}

async function runTest() {
  try {
    const data = await ensureData();

    // Login como operador
    const login = await fetch(`${BASE}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'operador@ferrypass.com', password: 'senha123' }) });
    const loginJson = await login.json();
    if (!login.ok) { console.error('Login operador falhou', loginJson); process.exit(1); }
    const token = loginJson.token;

    // Emitir ticket
    const ticketRes = await fetch(`${BASE}/api/tickets`, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ sailing_id: data.sailing.id, client_id: data.client.id, fare_item_id: data.fare.id, ticket_type: 'passageiro' }) });
    const ticketJson = await ticketRes.json();
    console.log('POST /api/tickets ->', ticketRes.status, ticketJson);
  } catch (err) {
    console.error('Erro no teste de emissão:', err);
  }
}

runTest();
