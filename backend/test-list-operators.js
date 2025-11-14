import { allAsync, initializeDatabase } from './src/models/database-pg.js';

async function listOperators() {
  try {
    await initializeDatabase();
    const rows = await allAsync('SELECT id, email, name, role, created_at FROM operators ORDER BY id');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error('Erro ao listar operadores:', err.message || err);
    process.exit(1);
  }
}

listOperators();
