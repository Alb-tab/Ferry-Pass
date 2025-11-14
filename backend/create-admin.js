#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import { runAsync, initializeDatabase } from './src/models/database-pg.js';

const args = process.argv.slice(2);
const email = args[0] || 'admin@ferrypass.com';
const password = args[1] || 'admin123';
const name = args[2] || 'Admin FerryPass';

console.log('\n🔐 Criando operador ADMIN...\n');

async function createAdmin() {
  try {
    // Garantir que o DB está inicializado (migrações, colunas)
    await initializeDatabase();
    const hashed = await bcrypt.hash(password, 10);
    console.log('📝 Inserindo admin no banco...');
    const result = await runAsync(
      'INSERT INTO operators (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashed, name, 'admin']
    );

    console.log('\n✅ ✅ ✅ Admin criado com sucesso! ✅ ✅ ✅\n');
    console.log('📋 Credenciais de login:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}`);
    console.log(`   Nome: ${name}`);
    console.log(`   Role: admin\n`);
    process.exit(0);
  } catch (err) {
    if (err.message && (err.message.includes('duplicate') || err.message.includes('already exists') || err.message.includes('unique'))) {
      console.log('ℹ️  Admin já existe (ou email duplicado)');
      process.exit(0);
    }
    console.error('❌ Erro:', err.message || err);
    process.exit(1);
  }
}

createAdmin();
