#!/usr/bin/env node

import bcrypt from 'bcryptjs';
import { runAsync } from './src/models/database-pg.js';

console.log('\n🔐 Criando operador de teste...\n');

const email = 'operador@ferrypass.com';
const password = 'senha123';
const name = 'Operador FerryPass';

async function createOperator() {
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    console.log('📝 Inserindo operador no banco...');
    const result = await runAsync(
      'INSERT INTO operators (email, password_hash, name, role) VALUES ($1, $2, $3, $4) RETURNING id',
      [email, hashedPassword, name, 'operator']
    );

    console.log('\n✅ ✅ ✅ Operador criado com sucesso! ✅ ✅ ✅\n');
    console.log('📋 Credenciais de login:');
    console.log(`   Email: ${email}`);
    console.log(`   Senha: ${password}\n`);

    process.exit(0);
  } catch (err) {
    if (err.message.includes('duplicate') || err.message.includes('already exists')) {
      console.log('ℹ️  Operador já existe');
      process.exit(0);
    } else {
      console.error('❌ Erro:', err.message);
      process.exit(1);
    }
  }
}

createOperator();
