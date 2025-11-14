#!/usr/bin/env node

/**
 * Script para popular o banco de dados com dados de teste
 * Use: node seed.js (a partir de backend/)
 */

import { getDatabase, initializeDatabase } from './src/models/database.js';
import bcrypt from 'bcryptjs';

async function seed() {
  console.log('\n🌱 Iniciando seed do banco de dados...\n');

  const db = getDatabase();

  return new Promise((resolve, reject) => {
    db.serialize(async () => {
      try {
        // 1. Operadores
        console.log('📝 Inserindo operadores...');
        const operadorPassword = await bcrypt.hash('senha123', 10);
        
        db.run(
          'INSERT OR IGNORE INTO operators (email, password, name, role) VALUES (?, ?, ?, ?)',
          ['operador@ferrypass.com', operadorPassword, 'Operador Padrão', 'operator'],
          function(err) {
            if (err) console.error('Erro ao inserir operador:', err);
            else console.log('✓ Operador criado (email: operador@ferrypass.com, senha: senha123)');
          }
        );

        // 2. Clientes
        console.log('📝 Inserindo clientes...');
        const clients = [
          ['123.456.789-00', 'João Silva', 'joao@email.com', '(11) 99999-9999'],
          ['987.654.321-11', 'Maria Santos', 'maria@email.com', '(21) 98888-8888'],
          ['111.222.333-44', 'Pedro Oliveira', 'pedro@email.com', '(85) 97777-7777'],
        ];

        clients.forEach(([cpf, name, email, phone]) => {
          db.run(
            'INSERT OR IGNORE INTO clients (cpf, name, email, phone) VALUES (?, ?, ?, ?)',
            [cpf, name, email, phone],
            function(err) {
              if (err) console.error(`Erro ao inserir cliente ${name}:`, err);
              else console.log(`✓ Cliente criado: ${name}`);
            }
          );
        });

        // 3. Rotas
        console.log('📝 Inserindo rotas...');
        const routes = [
          ['Rio-Niterói', 'Rio de Janeiro', 'Niterói', 30],
          ['Santos-Guarujá', 'Santos', 'Guarujá', 20],
          ['Belém-Mosqueiro', 'Belém', 'Mosqueiro', 45],
        ];

        routes.forEach(([name, origin, destination, duration]) => {
          db.run(
            'INSERT OR IGNORE INTO routes (name, origin, destination, duration_minutes) VALUES (?, ?, ?, ?)',
            [name, origin, destination, duration],
            function(err) {
              if (err) console.error(`Erro ao inserir rota ${name}:`, err);
              else console.log(`✓ Rota criada: ${name}`);
            }
          );
        });

        // 4. Viagens (setTimeout para garantir que rotas existam)
        setTimeout(() => {
          console.log('📝 Inserindo viagens...');
          
          db.all('SELECT id FROM routes LIMIT 3', (err, routes) => {
            if (err || !routes) {
              console.error('Erro ao buscar rotas:', err);
              return;
            }

            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowISO = tomorrow.toISOString();

            routes.forEach((route) => {
              const sailings = [
                [route.id, tomorrowISO.replace('T', ' ').substring(0, 19), 200, 50],
                [route.id, tomorrowISO.replace(/T[\d:.-]+/, 'T14:00:00').replace('T', ' ').substring(0, 19), 200, 50],
              ];

              sailings.forEach(([route_id, departure, cap_pass, cap_veh]) => {
                db.run(
                  'INSERT OR IGNORE INTO sailings (route_id, departure, capacity_passengers, capacity_vehicles) VALUES (?, ?, ?, ?)',
                  [route_id, departure, cap_pass, cap_veh],
                  function(err) {
                    if (err) console.error(`Erro ao inserir viagem:`, err);
                    else console.log(`✓ Viagem criada para rota ${route_id}`);
                  }
                );
              });
            });
          });
        }, 500);

        // 5. Tarifas (setTimeout)
        setTimeout(() => {
          console.log('📝 Inserindo tarifas...');
          
          db.all('SELECT id FROM routes', (err, routes) => {
            if (err || !routes) {
              console.error('Erro ao buscar rotas:', err);
              return;
            }

            const fares = [
              ['passageiro', 25.00],
              ['carro', 80.00],
              ['moto', 40.00],
              ['caminhão', 150.00],
            ];

            routes.forEach((route) => {
              fares.forEach(([type, amount]) => {
                db.run(
                  'INSERT OR IGNORE INTO fares (route_id, vehicle_type, amount) VALUES (?, ?, ?)',
                  [route.id, type, amount],
                  function(err) {
                    if (err) console.error(`Erro ao inserir tarifa:`, err);
                    else console.log(`✓ Tarifa criada: ${type} - R$ ${amount}`);
                  }
                );
              });
            });
          });
        }, 1000);

        // 6. Veículos
        console.log('📝 Inserindo veículos...');
        const vehicles = [
          ['ABC1D23', 'Honda Civic', 'carro', 1],
          ['XYZ9K88', 'Toyota Corolla', 'carro', 2],
          ['MOT5P11', 'Honda CB 500', 'moto', 3],
        ];

        vehicles.forEach(([plate, model, type, owner]) => {
          db.run(
            'INSERT OR IGNORE INTO vehicles (plate, model, vehicle_type, owner_client_id) VALUES (?, ?, ?, ?)',
            [plate, model, type, owner],
            function(err) {
              if (err) console.error(`Erro ao inserir veículo ${plate}:`, err);
              else console.log(`✓ Veículo criado: ${plate} - ${model}`);
            }
          );
        });

        setTimeout(() => {
          console.log('\n✨ Seed concluído com sucesso!\n');
          console.log('📌 Credenciais de teste:');
          console.log('   Email: operador@ferrypass.com');
          console.log('   Senha: senha123\n');
          resolve();
        }, 1500);

      } catch (error) {
        console.error('Erro durante seed:', error);
        reject(error);
      }
    });
  });
}

// Executar seed
initializeDatabase();
seed().then(() => {
  console.log('✅ Pronto para usar!');
  process.exit(0);
}).catch((error) => {
  console.error('❌ Erro:', error);
  process.exit(1);
});
