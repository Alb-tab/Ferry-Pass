-- Script de setup do FerryPass para PostgreSQL 18

-- Criar usuário ferrypass_user se não existir
DO $$ BEGIN
  IF NOT EXISTS (SELECT FROM pg_user WHERE usename = 'ferrypass_user') THEN
    CREATE USER ferrypass_user WITH PASSWORD 'ferrypass_123';
  END IF;
END $$;

-- Criar banco ferrypass se não existir
SELECT 'CREATE DATABASE ferrypass OWNER ferrypass_user'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'ferrypass')\gexec

-- Dar permissões
GRANT ALL PRIVILEGES ON DATABASE ferrypass TO ferrypass_user;

-- Conectar ao banco ferrypass
\c ferrypass

-- Criar tabelas
CREATE TABLE IF NOT EXISTS operators (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
  id SERIAL PRIMARY KEY,
  cpf VARCHAR(11) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS vehicles (
  id SERIAL PRIMARY KEY,
  plate VARCHAR(10) UNIQUE NOT NULL,
  model VARCHAR(255),
  capacity INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS routes (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  origin VARCHAR(255) NOT NULL,
  destination VARCHAR(255) NOT NULL,
  distance_km DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sailings (
  id SERIAL PRIMARY KEY,
  route_id INT NOT NULL REFERENCES routes(id),
  vehicle_id INT NOT NULL REFERENCES vehicles(id),
  departure_time TIMESTAMP NOT NULL,
  arrival_time TIMESTAMP NOT NULL,
  available_seats INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS fares (
  id SERIAL PRIMARY KEY,
  route_id INT NOT NULL REFERENCES routes(id),
  passenger_price DECIMAL(10, 2),
  vehicle_price DECIMAL(10, 2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

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

-- Dar permissões finais
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ferrypass_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ferrypass_user;

\echo ''
\echo '✅ ✅ ✅ PostgreSQL configurado com sucesso! ✅ ✅ ✅'
\echo 'Banco: ferrypass'
\echo 'Usuário: ferrypass_user'
\echo 'Senha: ferrypass_123'
