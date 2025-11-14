import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { allAsync, runAsync, getAsync } from '../models/database-pg.js';
import { generateTicketPDF } from '../utils/pdfGenerator.js';
import { sendEmail } from '../utils/emailService.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Criar passagem (ticket)
router.post('/', verifyToken, async (req, res) => {
  try {
    const { sailing_id, client_id, vehicle_id = null, fare_item_id = null, ticket_type = 'passageiro', loaded_state = null } = req.body;

    if (!sailing_id || !client_id) {
      return res.status(400).json({ error: 'sailing_id e client_id são obrigatórios' });
    }

    // validar sailing
    const sailing = await getAsync('SELECT s.*, r.id as route_id, r.name as route_name, r.origin, r.destination FROM sailings s JOIN routes r ON s.route_id = r.id WHERE s.id = $1', [sailing_id]);
    if (!sailing) return res.status(400).json({ error: 'Sailing não encontrado' });

    // validar client
    const client = await getAsync('SELECT * FROM clients WHERE id = $1', [client_id]);
    if (!client) return res.status(400).json({ error: 'Client não encontrado' });

    // validar vehicle se informado
    let vehicle = null;
    if (vehicle_id) {
      vehicle = await getAsync('SELECT * FROM vehicles WHERE id = $1', [vehicle_id]);
      if (!vehicle) return res.status(400).json({ error: 'Vehicle não encontrado' });
    }

    // Determinar tarifa
    let fareItem = null;
    if (fare_item_id) {
      fareItem = await getAsync('SELECT * FROM fare_items WHERE id = $1', [fare_item_id]);
      if (!fareItem) return res.status(400).json({ error: 'fare_item não encontrado' });
    } else {
      // Tentar buscar por rota + vehicle_type/loaded_state ou categoria passageiro
      const routeId = sailing.route_id;
      if (ticket_type === 'passageiro') {
        fareItem = await getAsync('SELECT * FROM fare_items WHERE route_id = $1 AND vehicle_type = $2 AND active = true LIMIT 1', [routeId, 'passageiro']);
      } else {
        // espera que caller informe vehicle_type via body.vehicle_type
        const vehicle_type = req.body.vehicle_type;
        if (!vehicle_type) return res.status(400).json({ error: 'vehicle_type é obrigatório para tickets de veículo quando fare_item_id não informado' });
        fareItem = await getAsync('SELECT * FROM fare_items WHERE route_id = $1 AND vehicle_type = $2 AND (loaded_state = $3 OR loaded_state IS NULL) AND active = true ORDER BY CASE WHEN loaded_state=$3 THEN 0 ELSE 1 END LIMIT 1', [routeId, vehicle_type, loaded_state]);
      }
      if (!fareItem) return res.status(400).json({ error: 'Tarifa não encontrada para os parâmetros informados' });
    }

    const amount = parseFloat(fareItem.amount || 0);

    // Gerar código único
    const code = `TICKET-${sailing_id}-${Date.now()}-${uuidv4().slice(0, 8)}`;

    // Inserir ticket
    const insertRes = await runAsync(
      `INSERT INTO tickets (code, sailing_id, client_id, ticket_type, price, pdf_path, qr_code, email_sent) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id`,
      [code, sailing_id, client_id, ticket_type, amount, null, null, false]
    );
    const ticketId = insertRes.rows[0].id;

    // Buscar dados completos para gerar PDF
    const ticket = await getAsync(
      `SELECT t.id, t.code, t.price as fare_paid, c.id as client_id, c.name, c.email, c.phone, v.plate, v.model, s.departure, r.name as route_name, r.origin, r.destination
       FROM tickets t
       JOIN clients c ON t.client_id = c.id
       LEFT JOIN vehicles v ON t.vehicle_id = v.id
       JOIN sailings s ON t.sailing_id = s.id
       JOIN routes r ON s.route_id = r.id
       WHERE t.id = $1`,
      [ticketId]
    );

    // Gerar PDF
    const pdfPath = await generateTicketPDF(ticket);

    // Atualizar registro com pdf_path e qr_code
    await runAsync('UPDATE tickets SET pdf_path = $1, qr_code = $2 WHERE id = $3', [pdfPath, code, ticketId]);

    // Enviar e-mail com PDF se cliente tiver email
    if (client.email) {
      await sendEmail(client.email, `Sua passagem FerryPass - ${code}`, `Olá ${client.name}!\nSua passagem foi emitida.\nCódigo: ${code}`, pdfPath);
      await runAsync('UPDATE tickets SET email_sent = true WHERE id = $1', [ticketId]);
    }

    res.status(201).json({ id: ticketId, code, ticket_url: `/api/tickets/${code}/pdf`, price: amount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao criar passagem' });
  }
});

// Buscar passagem por código (para impressão)
router.get('/:code/pdf', async (req, res) => {
  try {
    const { code } = req.params;

    const ticket = await getAsync(
      `SELECT t.*, c.name, c.email, c.phone, v.plate, v.model, s.departure, r.name as route_name, r.origin, r.destination
       FROM tickets t
       JOIN clients c ON t.client_id = c.id
       LEFT JOIN vehicles v ON t.vehicle_id = v.id
       JOIN sailings s ON t.sailing_id = s.id
       JOIN routes r ON s.route_id = r.id
       WHERE t.code = ?`,
      [code]
    );

    if (!ticket) {
      return res.status(404).json({ error: 'Passagem não encontrada' });
    }

    // Gerar PDF
    const pdfPath = await generateTicketPDF(ticket);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="ticket-${code}.pdf"`);
    res.sendFile(pdfPath);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao gerar PDF' });
  }
});

// Listar passagens (com filtros)
router.get('/', async (req, res) => {
  try {
    const { code, client_id } = req.query;

    let sql = `SELECT t.*, c.name, v.plate, r.name as route_name FROM tickets t
               JOIN clients c ON t.client_id = c.id
               LEFT JOIN vehicles v ON t.vehicle_id = v.id
               JOIN sailings s ON t.sailing_id = s.id
               JOIN routes r ON s.route_id = r.id`;
    let params = [];

    if (code) {
      sql += ' WHERE t.code = ?';
      params = [code];
    } else if (client_id) {
      sql += ' WHERE t.client_id = ?';
      params = [client_id];
    }

    sql += ' ORDER BY t.created_at DESC';

    const tickets = await allAsync(sql, params);
    res.json(tickets);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Erro ao listar passagens' });
  }
});

export default router;
