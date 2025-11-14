import nodemailer from 'nodemailer';
import fs from 'fs';

let transporter;

export function initializeEmail() {
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });

  console.log('✓ Serviço de e-mail configurado');
}

export async function sendEmail(to, subject, text, attachmentPath = null) {
  try {
    if (!transporter) {
      initializeEmail();
    }

    const mailOptions = {
      from: process.env.SMTP_FROM,
      to,
      subject,
      text,
      html: `<pre>${text}</pre>`
    };

    if (attachmentPath && fs.existsSync(attachmentPath)) {
      mailOptions.attachments = [
        {
          filename: `ticket.pdf`,
          path: attachmentPath
        }
      ];
    }

    const result = await transporter.sendMail(mailOptions);
    console.log(`✓ E-mail enviado para ${to}`);
    return result;
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    // Não rejeitar a requisição se o e-mail falhar
    return null;
  }
}

export async function sendWhatsApp(phone, message, attachmentUrl = null) {
  try {
    // Implementar integração com Twilio ou 360dialog aqui
    console.log(`✓ WhatsApp simulado para ${phone}: ${message}`);
    return true;
  } catch (error) {
    console.error('Erro ao enviar WhatsApp:', error);
    return false;
  }
}
