import dotenv from 'dotenv';
dotenv.config();

import { Pool } from 'pg';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Configuração do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'ferrypass_user',
  password: process.env.DB_PASSWORD || 'ferrypass_123',
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'ferrypass'
});

pool.on('error', (err) => {
  console.error('❌ Erro não esperado no pool do PostgreSQL:', err);
});

export async function initializeDatabase() {
  try {
    console.log('\n📦 Inicializando banco de dados PostgreSQL...\n');

    const client = await pool.connect();

    try {
      // Criar tabelas
      await client.query(`
        CREATE TABLE IF NOT EXISTS operators (
          id SERIAL PRIMARY KEY,
          email VARCHAR(255) UNIQUE NOT NULL,
          password_hash VARCHAR(255) NOT NULL,
          name VARCHAR(255),
          role VARCHAR(50) DEFAULT 'operator',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela operators criada');

      // Garantir coluna role para operadores (migrate safe)
      try {
        await client.query(`ALTER TABLE operators ADD COLUMN IF NOT EXISTS role VARCHAR(50) DEFAULT 'operator';`);
      } catch (err) {
        // ignorar
      }

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
      console.log('✅ Tabela clients criada');

      await client.query(`
        CREATE TABLE IF NOT EXISTS vehicles (
          id SERIAL PRIMARY KEY,
          plate VARCHAR(10) UNIQUE NOT NULL,
          model VARCHAR(255),
          capacity INT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela vehicles criada');

      await client.query(`
        CREATE TABLE IF NOT EXISTS routes (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          origin VARCHAR(255) NOT NULL,
          destination VARCHAR(255) NOT NULL,
          distance_km DECIMAL(10, 2),
          duration_minutes INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela routes criada');

      // Garante colunas compatíveis com versões anteriores
      try {
        await client.query(`ALTER TABLE routes ADD COLUMN IF NOT EXISTS duration_minutes INTEGER;`);
      } catch (err) {
        // ignorar se já existir ou se versão do PG não suportar IF NOT EXISTS
      }

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
      console.log('✅ Tabela sailings criada');

      await client.query(`
        CREATE TABLE IF NOT EXISTS fares (
          id SERIAL PRIMARY KEY,
          route_id INT NOT NULL REFERENCES routes(id),
          passenger_price DECIMAL(10, 2),
          vehicle_price DECIMAL(10, 2),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela fares criada');

      // Tabela granular de tarifas (itens) - facilita representação das categorias do spec
      await client.query(`
        CREATE TABLE IF NOT EXISTS fare_items (
          id SERIAL PRIMARY KEY,
          route_id INT REFERENCES routes(id),
          category VARCHAR(100),
          vehicle_type VARCHAR(100),
          loaded_state VARCHAR(50),
          amount DECIMAL(10,2) NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela fare_items criada');

      // Coluna para soft-delete / ativação das tarifas
      try {
        await client.query(`ALTER TABLE fare_items ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT TRUE;`);
      } catch (err) {
        // ignora se não suportado
      }

      // Seed: criar rota padrão se não existir e semear tarifas (apenas se a tabela estiver vazia)
      const countRes = await client.query(`SELECT COUNT(*)::int AS cnt FROM fare_items;`);
      const count = countRes.rows[0].cnt;
      if (count === 0) {
        // Garantir uma rota padrão
        let routeRes = await client.query(`SELECT id FROM routes LIMIT 1;`);
        let defaultRouteId;
        if (routeRes.rows.length === 0) {
          const r = await client.query(`INSERT INTO routes (name, origin, destination, duration_minutes) VALUES ($1,$2,$3,$4) RETURNING id`, ['Linha Padrão','Origem','Destino',60]);
          defaultRouteId = r.rows[0].id;
        } else {
          defaultRouteId = routeRes.rows[0].id;
        }

        console.log('🌱 Semear tarifas iniciais na rota id=', defaultRouteId);

        // Passageiros
        const passengerFares = [
          { category: 'passageiro_ate5', vehicle_type: 'passageiro', loaded_state: null, amount: 0 },
          { category: 'passageiro_idoso_60+', vehicle_type: 'passageiro', loaded_state: null, amount: 0 },
          { category: 'passageiro_5_10', vehicle_type: 'passageiro', loaded_state: null, amount: 2.00 },
          { category: 'passageiro_acima_10', vehicle_type: 'passageiro', loaded_state: null, amount: 10.00 },
          { category: 'estudante', vehicle_type: 'passageiro', loaded_state: null, amount: 5.00 }
        ];

        for (const f of passengerFares) {
          await client.query(`INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount) VALUES ($1,$2,$3,$4,$5)`, [defaultRouteId, f.category, f.vehicle_type, f.loaded_state, f.amount]);
        }

        // Veículos leves/medios
        const vehicleFares = [
          { category: 'veiculo_passeio_ate4m', vehicle_type: 'carro_passeio', amount: 100.00 },
          { category: 'veiculo_passeio_acima4m', vehicle_type: 'carro_passeio', amount: 115.00 },
          { category: 'pickup_furgao_van_gt4m', vehicle_type: 'van', amount: 130.00 },
          { category: 'caminhonete_f250', vehicle_type: 'caminhonete', amount: 150.00 },
          { category: 'van_grande_20', vehicle_type: 'van_grande', amount: 150.00 }
        ];
        for (const f of vehicleFares) {
          await client.query(`INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount) VALUES ($1,$2,$3,$4,$5)`, [defaultRouteId, f.category, f.vehicle_type, null, f.amount]);
        }

        // Reboques
        const reboques = [
          { category: 'reboque_medio_ate4m_vazio', vehicle_type: 'reboque', loaded_state: 'vazio', amount: 120.00 },
          { category: 'reboque_medio_ate4m_carregado', vehicle_type: 'reboque', loaded_state: 'carregado', amount: 160.00 },
          { category: 'reboque_4_8m_vazio', vehicle_type: 'reboque', loaded_state: 'vazio', amount: 205.00 },
          { category: 'reboque_4_8m_carregado', vehicle_type: 'reboque', loaded_state: 'carregado', amount: 250.00 },
          { category: 'reboque_8_12m_vazio', vehicle_type: 'reboque', loaded_state: 'vazio', amount: 240.00 },
          { category: 'reboque_8_12m_carregado', vehicle_type: 'reboque', loaded_state: 'carregado', amount: 300.00 }
        ];
        for (const f of reboques) await client.query(`INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount) VALUES ($1,$2,$3,$4,$5)`, [defaultRouteId, f.category, f.vehicle_type, f.loaded_state, f.amount]);

        // Caminhões (vazio/carregado)
        const trucks = [
          { category: 'cam_platforma_3_4_vazio', vehicle_type: 'camiao', loaded_state: 'vazio', amount: 220.00 },
          { category: 'cam_platforma_3_4_carregado', vehicle_type: 'camiao', loaded_state: 'carregado', amount: 285.00 },
          { category: 'cam_3_4_vazio', vehicle_type: 'camiao', loaded_state: 'vazio', amount: 175.00 },
          { category: 'cam_3_4_carregado', vehicle_type: 'camiao', loaded_state: 'carregado', amount: 210.00 },
          { category: 'cam_truck_platforma_vazio', vehicle_type: 'camiao', loaded_state: 'vazio', amount: 270.00 },
          { category: 'cam_truck_platforma_carregado', vehicle_type: 'camiao', loaded_state: 'carregado', amount: 390.00 },
          { category: 'carreta_cavalo_vazio', vehicle_type: 'carreta', loaded_state: 'vazio', amount: 660.00 },
          { category: 'carreta_cavalo_carregado', vehicle_type: 'carreta', loaded_state: 'carregado', amount: 820.00 },
          { category: 'bitrem_vazio', vehicle_type: 'bitrem', loaded_state: 'vazio', amount: 865.00 },
          { category: 'bitrem_carregado', vehicle_type: 'bitrem', loaded_state: 'carregado', amount: 1100.00 }
        ];
        for (const f of trucks) await client.query(`INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount) VALUES ($1,$2,$3,$4,$5)`, [defaultRouteId, f.category, f.vehicle_type, f.loaded_state, f.amount]);

        // Ônibus / Micro
        const buses = [
          { category: 'micro_ate29', vehicle_type: 'microonibus', loaded_state: null, amount: 220.00 },
          { category: 'onibus_toco_2eixos', vehicle_type: 'onibus', loaded_state: null, amount: 280.00 },
          { category: 'onibus_truck_3eixos', vehicle_type: 'onibus', loaded_state: null, amount: 420.00 }
        ];
        for (const f of buses) await client.query(`INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount) VALUES ($1,$2,$3,$4,$5)`, [defaultRouteId, f.category, f.vehicle_type, f.loaded_state, f.amount]);

        // Máquinas pesadas
        const heavy = [
          { category: 'pa_pequena', vehicle_type: 'maquina', loaded_state: null, amount: 600.00 },
          { category: 'pa_grande', vehicle_type: 'maquina', loaded_state: null, amount: 780.00 },
          { category: 'trator_pequeno', vehicle_type: 'maquina', loaded_state: null, amount: 270.00 },
          { category: 'trator_medio', vehicle_type: 'maquina', loaded_state: null, amount: 495.00 },
          { category: 'trator_grande', vehicle_type: 'maquina', loaded_state: null, amount: 780.00 },
          { category: 'retroescavadeira', vehicle_type: 'maquina', loaded_state: null, amount: 285.00 },
          { category: 'guindaste', vehicle_type: 'maquina', loaded_state: null, amount: 1500.00 },
          { category: 'patrol', vehicle_type: 'maquina', loaded_state: null, amount: 1200.00 }
        ];
        for (const f of heavy) await client.query(`INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount) VALUES ($1,$2,$3,$4,$5)`, [defaultRouteId, f.category, f.vehicle_type, f.loaded_state, f.amount]);

        // Motos e pequenos
        const small = [
          { category: 'quadriciclo', vehicle_type: 'moto', loaded_state: null, amount: 75.00 },
          { category: 'triciclo', vehicle_type: 'moto', loaded_state: null, amount: 75.00 },
          { category: 'moto', vehicle_type: 'moto', loaded_state: null, amount: 30.00 }
        ];
        for (const f of small) await client.query(`INSERT INTO fare_items (route_id, category, vehicle_type, loaded_state, amount) VALUES ($1,$2,$3,$4,$5)`, [defaultRouteId, f.category, f.vehicle_type, f.loaded_state, f.amount]);

        console.log('🌱 Seed de tarifas concluído');
      }

      await client.query(`
        CREATE TABLE IF NOT EXISTS tickets (
          id SERIAL PRIMARY KEY,
          code VARCHAR(50) UNIQUE NOT NULL,
          sailing_id INT NOT NULL REFERENCES sailings(id),
          client_id INT NOT NULL REFERENCES clients(id),
          vehicle_id INT REFERENCES vehicles(id),
          ticket_type VARCHAR(20) NOT NULL,
          seat_or_slot VARCHAR(50),
          price DECIMAL(10, 2),
          pdf_path VARCHAR(255),
          qr_code VARCHAR(255),
          email_sent BOOLEAN DEFAULT FALSE,
          status VARCHAR(20) DEFAULT 'active',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
      console.log('✅ Tabela tickets criada');

      // Garantir colunas para tickets (migrations safe)
      try {
        await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS vehicle_id INT REFERENCES vehicles(id);`);
        await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS seat_or_slot VARCHAR(50);`);
        await client.query(`ALTER TABLE tickets ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active';`);
      } catch (err) {
        // ignore
      }

      console.log('\n✅ ✅ ✅ BANCO DE DADOS INICIALIZADO COM SUCESSO! ✅ ✅ ✅\n');
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('❌ Erro ao inicializar banco de dados:', err.message);
    throw err;
  }
}

// Funções de acesso ao banco
export async function runQuery(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (err) {
    console.error('Erro na query:', err.message);
    throw err;
  }
}

export async function getAsync(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result.rows[0];
  } catch (err) {
    console.error('Erro no getAsync:', err.message);
    throw err;
  }
}

export async function allAsync(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    console.error('Erro no allAsync:', err.message);
    throw err;
  }
}

export async function runAsync(query, params = []) {
  try {
    const result = await pool.query(query, params);
    return result;
  } catch (err) {
    console.error('Erro no runAsync:', err.message);
    throw err;
  }
}

export { pool };
