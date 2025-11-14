#!/usr/bin/env node

import { Pool } from 'pg';

const pool = new Pool({
  user: 'ferrypass_user',
  password: 'ferrypass_123',
  host: 'localhost',
  port: 5432,
  database: 'ferrypass'
});

console.log('\n🔌 Testando conexão ao PostgreSQL...\n');

try {
  const result = await pool.query('SELECT NOW()');
  console.log('✅ Conectado com sucesso ao PostgreSQL!');
  console.log('Hora do servidor:', result.rows[0].now);
  
  // Verificar tabelas
  const tables = await pool.query(`
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public'
    ORDER BY tablename;
  `);
  
  console.log('\n📊 Tabelas criadas:');
  tables.rows.forEach(row => {
    console.log(`  ✓ ${row.tablename}`);
  });
  
  console.log('\n✅ ✅ ✅ Tudo pronto! ✅ ✅ ✅\n');
} catch (err) {
  console.error('❌ Erro ao conectar:', err.message);
  process.exit(1);
} finally {
  await pool.end();
}
