#!/usr/bin/env node

import { Pool } from 'pg';

console.log('\n🔧 Configurando PostgreSQL para FerryPass...\n');

const postgresPassword = '244624';

const adminPool = new Pool({
  user: 'postgres',
  password: postgresPassword,
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});

async function setup() {
  try {
    console.log('1️⃣ Conectando como admin (postgres)...');
    let client = await adminPool.connect();
    
    try {
      console.log('2️⃣ Criando usuário ferrypass_user...');
      try {
        await client.query(`CREATE USER ferrypass_user WITH PASSWORD 'ferrypass_123';`);
        console.log('   ✅ Usuário criado');
      } catch (err) {
        if (err.message.includes('existe')) {
          console.log('   ℹ️  Usuário já existe');
        } else {
          throw err;
        }
      }

      console.log('3️⃣ Criando banco ferrypass...');
      try {
        await client.query(`CREATE DATABASE ferrypass OWNER ferrypass_user;`);
        console.log('   ✅ Banco criado');
      } catch (err) {
        if (err.message.includes('existe')) {
          console.log('   ℹ️  Banco já existe');
        } else {
          throw err;
        }
      }

      console.log('4️⃣ Dando permissões...');
      await client.query(`GRANT ALL PRIVILEGES ON DATABASE ferrypass TO ferrypass_user;`);
      console.log('   ✅ Permissões concedidas');

    } finally {
      client.release();
    }

    console.log('5️⃣ Criando tabelas...');
    
    const appPool = new Pool({
      user: 'ferrypass_user',
      password: 'ferrypass_123',
      host: 'localhost',
      port: 5432,
      database: 'ferrypass'
    });

    client = await appPool.connect();

    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS operators (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('   ✅ Tabela operators');

      await client.query(`
        CREATE TABLE IF NOT EXISTS clients (
          id SERIAL PRIMARY KEY,
          cpf VARCHAR(11) UNIQUE NOT NULL,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255),
          phone VARCHAR(20),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('   ✅ Tabela clients');

      await client.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id SERIAL PRIMARY KEY,
          plate VARCHAR(10) UNIQUE NOT NULL,
          model VARCHAR(255),
          capacity INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('   ✅ Tabela vehicles');

      await client.query(`
        CREATE TABLE IF NOT EXISTS routes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          origin VARCHAR(255) NOT NULL,
          destination VARCHAR(255) NOT NULL,
          distance_km DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('   ✅ Tabela routes');

      await client.query(`
        CREATE TABLE IF NOT EXISTS sailings (
          id SERIAL PRIMARY KEY,
          route_id INT NOT NULL REFERENCES routes(id),
          vehicle_id INT NOT NULL REFERENCES vehicles(id),
          departure_time TIMESTAMP NOT NULL,
          arrival_time TIMESTAMP NOT NULL,
          available_seats INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('   ✅ Tabela sailings');

      await client.query(`
        CREATE TABLE IF NOT EXISTS fares (
          id SERIAL PRIMARY KEY,
          route_id INT NOT NULL REFERENCES routes(id),
          passenger_price DECIMAL(10, 2),
          vehicle_price DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('   ✅ Tabela fares');

      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          sailing_id INT NOT NULL REFERENCES sailings(id),
          client_id INT NOT NULL REFERENCES clients(id),
          ticket_type VARCHAR(20) NOT NULL,
          price DECIMAL(10, 2),
          pdf_path VARCHAR(255),
          qr_code VARCHAR(255),
          email_sent BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('   ✅ Tabela tickets');

      console.log('\n✅ ✅ ✅ PostgreSQL Configurado! ✅ ✅ ✅\n');

    } finally {
      client.release();
      await appPool.end();
    }

  } catch (err) {
    console.error('\n❌ Erro:', err.message);
    process.exit(1);
  } finally {
    await adminPool.end();
  }
}

setup();
