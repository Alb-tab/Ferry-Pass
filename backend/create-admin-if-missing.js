#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import { getAsync, runAsync, allAsync, initializeDatabase } from './src/models/database-pg.js';

const args = process.argv.slice(2);
const email = args[0] || 'admin@ferrypass.com';
const password = args[1] || 'admin123';
const name = args[2] || 'Admin FerryPass';

console.log('\n🔎 Verificando existência de admin...\n');

async function ensureAdmin() {
  try {
    // Garantir que as migrações/inicialização do DB foram aplicadas
    await initializeDatabase();
    // pequeno delay para consistência
    // await new Promise(r => setTimeout(r, 100));
    // Verifica se já existe um admin
    const existing = await getAsync('SELECT id, email, role FROM operators WHERE role = $1 LIMIT 1', ['admin']);
    if (existing) {
      console.log('ℹ️  Admin já existe:', existing);
      process.exit(0);
    }

    // Se não existir, criar com as credenciais informadas
    const hashed = await bcrypt.hash(password, 10);
    const res = await runAsync('INSERT INTO operators (email, password_hash, name, role) VALUES ($1,$2,$3,$4) RETURNING id, email, role', [email, hashed, name, 'admin']);
    const created = res.rows && res.rows[0];
    console.log('\n✅ Admin criado:', created);
    process.exit(0);
  } catch (err) {
    console.error('❌ Erro ao garantir admin:', err.message || err);
    process.exit(1);
  }
}

ensureAdmin();
