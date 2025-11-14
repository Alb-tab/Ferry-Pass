import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = process.env.DB_PATH || path.join(__dirname, '../../ferrypass.db');

let db;

export function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Erro ao conectar ao banco:', err);
        process.exit(1);
      }
      console.log(`✓ Banco de dados conectado: ${dbPath}`);
    });
  }
  return db;
}

export function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    
    database.serialize(() => {
      // Criar tabelas se não existirem
      database.run(`
        CREATE TABLE IF NOT EXISTS clients (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          cpf VARCHAR(14) UNIQUE NOT NULL,
          name VARCHAR(200) NOT NULL,
          email VARCHAR(200),
          phone VARCHAR(50),
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          plate VARCHAR(10) UNIQUE NOT NULL,
          model VARCHAR(200),
          vehicle_type VARCHAR(50),
          owner_client_id INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (owner_client_id) REFERENCES clients(id)
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS routes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(200),
          origin VARCHAR(100),
          destination VARCHAR(100),
          duration_minutes INTEGER
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS sailings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          route_id INTEGER NOT NULL,
          departure DATETIME NOT NULL,
          capacity_passengers INTEGER,
          capacity_vehicles INTEGER,
          FOREIGN KEY (route_id) REFERENCES routes(id)
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS fares (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          route_id INTEGER NOT NULL,
          vehicle_type VARCHAR(50),
          amount DECIMAL(10,2) NOT NULL,
          FOREIGN KEY (route_id) REFERENCES routes(id)
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS tickets (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          sailing_id INTEGER NOT NULL,
          client_id INTEGER,
          vehicle_id INTEGER,
          seat_or_slot VARCHAR(20),
          fare_paid DECIMAL(10,2),
          code VARCHAR(100) UNIQUE NOT NULL,
          status VARCHAR(50) DEFAULT 'active',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (sailing_id) REFERENCES sailings(id),
          FOREIGN KEY (client_id) REFERENCES clients(id),
          FOREIGN KEY (vehicle_id) REFERENCES vehicles(id)
        )
      `);

      database.run(`
        CREATE TABLE IF NOT EXISTS operators (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email VARCHAR(200) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          name VARCHAR(200),
          role VARCHAR(50) DEFAULT 'operator',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `, (err) => {
        if (err) {
          console.error('Erro ao criar tabelas:', err);
          reject(err);
        } else {
          console.log('✓ Tabelas verificadas/criadas com sucesso');
          resolve();
        }
      });
    });
  });
}

export function runAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ id: this.lastID, changes: this.changes });
    });
  });
}

export function getAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

export function allAsync(sql, params = []) {
  return new Promise((resolve, reject) => {
    const db = getDatabase();
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
}
