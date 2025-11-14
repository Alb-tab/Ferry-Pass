import puppeteer from 'puppeteer';
import QRCode from 'qrcode';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pdfDir = path.join(__dirname, '../../pdfs');

// Criar diretório se não existir
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir, { recursive: true });
}

export async function generateTicketPDF(ticket) {
  try {
    // Gerar QR Code
    const qrCodeData = await QRCode.toDataURL(`https://seusite.com/ticket/${ticket.code}`);

    // HTML do ticket
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Passagem FerryPass</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
          .ticket { background: white; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }
          .header h1 { color: #007bff; margin: 0 0 10px 0; }
          .header p { margin: 0; color: #666; }
          .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 30px; }
          .info-item { padding: 15px; background: #f9f9f9; border-radius: 4px; }
          .info-item label { display: block; font-weight: bold; color: #333; margin-bottom: 5px; font-size: 12px; }
          .info-item value { display: block; color: #007bff; font-size: 16px; }
          .route-info { grid-column: 1 / -1; padding: 20px; background: #e8f4f8; border-radius: 4px; text-align: center; }
          .route-info h3 { margin: 0 0 10px 0; color: #007bff; }
          .route-info p { margin: 5px 0; color: #333; }
          .qr-section { text-align: center; padding: 20px; background: #f9f9f9; border-radius: 4px; margin-bottom: 20px; }
          .qr-section img { max-width: 200px; height: auto; }
          .code { text-align: center; padding: 15px; background: #007bff; color: white; border-radius: 4px; font-weight: bold; font-size: 18px; margin-bottom: 20px; }
          .footer { text-align: center; color: #999; font-size: 12px; padding-top: 20px; border-top: 1px solid #ddd; }
          @page { size: A4; margin: 0; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="header">
            <h1>🚢 FerryPass</h1>
            <p>Sistema de Venda de Passagens de Ferry</p>
          </div>

          <div class="code">${ticket.code}</div>

          <div class="info-grid">
            <div class="info-item">
              <label>Passageiro</label>
              <value>${ticket.name}</value>
            </div>
            <div class="info-item">
              <label>CPF</label>
              <value>${ticket.client_id}</value>
            </div>
            ${ticket.plate ? `
            <div class="info-item">
              <label>Veículo</label>
              <value>${ticket.model} (${ticket.plate})</value>
            </div>
            ` : ''}
            <div class="info-item">
              <label>Valor</label>
              <value>R$ ${parseFloat(ticket.fare_paid).toFixed(2)}</value>
            </div>
          </div>

          <div class="route-info">
            <h3>${ticket.route_name}</h3>
            <p>De: <strong>${ticket.origin}</strong> Para: <strong>${ticket.destination}</strong></p>
            <p>Saída: <strong>${new Date(ticket.departure).toLocaleString('pt-BR')}</strong></p>
          </div>

          <div class="qr-section">
            <p>Escaneie para validação</p>
            <img src="${qrCodeData}" alt="QR Code">
          </div>

          <div class="footer">
            <p>Passagem gerada em ${new Date().toLocaleString('pt-BR')}</p>
            <p>Apresente este documento no embarque</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Renderizar HTML para PDF
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setContent(html);
    
    const pdfFileName = `ticket-${ticket.code}.pdf`;
    const pdfPath = path.join(pdfDir, pdfFileName);

    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: { top: 0, right: 0, bottom: 0, left: 0 }
    });

    await browser.close();

    console.log(`✓ PDF gerado: ${pdfPath}`);
    return pdfPath;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
