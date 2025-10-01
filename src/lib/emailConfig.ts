import nodemailer from 'nodemailer';

// Configuração do Nodemailer com fallback para teste
export const createEmailTransporter = () => {
  const hasGmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  const hasSmtpConfig =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasGmailConfig) {
    // Configurando Nodemailer com Gmail

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  if (hasSmtpConfig) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  // Usar transporter de teste do Nodemailer para desenvolvimento
  // ⚠️ Nenhuma configuração de email encontrada, usando conta de teste

  return nodemailer.createTestAccount().then(testAccount => {
    return nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  });
};

// Template de email de validação
export const createValidationEmailTemplate = (
  codigo: string,
  tipo: 'email' | 'telefone'
) => {
  return {
    subject: `Código de Validação - ${tipo === 'email' ? 'Email' : 'Telefone'}`,
    html: `
      <div class="email-container">
        <div class="email-header">
          <h1 class="email-title">🔐 Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}</h1>
        </div>

        <div class="email-body">
          <p class="email-message">
            Olá! Você solicitou a validação do seu ${tipo === 'email' ? 'endereço de email' : 'número de telefone'}.
          </p>

          <div class="code-container">
            <p class="code-label">Seu código de validação é:</p>
            <div class="code-value">
              ${codigo}
            </div>
          </div>

          <p class="warning-text">
            ⏰ Este código expira em <strong>5 minutos</strong>
          </p>

          <p class="info-text">
            Se você não solicitou esta validação, ignore este email.
          </p>
        </div>

        <div class="email-footer">
          <p class="footer-disclaimer">Este é um email automático, não responda.</p>
          <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
        </div>
      </div>

      <style>
        .email-container {
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: 0 auto;
        }
        .email-header {
          background: linear-gradient(135deg, #29abe2, #1e8bc3);
          color: white;
          padding: 20px;
          text-align: center;
          border-radius: 10px 10px 0 0;
        }
        .email-title {
          margin: 0;
          font-size: 24px;
        }
        .email-body {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 10px 10px;
        }
        .email-message {
          font-size: 16px;
          color: #333;
          margin-bottom: 20px;
        }
        .code-container {
          background: white;
          border: 2px solid #29abe2;
          border-radius: 8px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .code-label {
          margin: 0 0 10px 0;
          color: #666;
          font-size: 14px;
        }
        .code-value {
          font-size: 32px;
          font-weight: bold;
          color: #29abe2;
          letter-spacing: 5px;
          font-family: monospace;
        }
        .warning-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 10px;
        }
        .info-text {
          font-size: 14px;
          color: #666;
          margin-bottom: 0;
        }
        .email-footer {
          text-align: center;
          margin-top: 20px;
          color: #999;
          font-size: 12px;
        }
        .footer-disclaimer {
          margin: 0 0 5px 0;
        }
        .footer-text {
          margin: 0;
        }
      </style>
    `,
    text: `
      Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}

      Seu código de validação é: ${codigo}

      Este código expira em 5 minutos.

      Se você não solicitou esta validação, ignore este email.

      © 2024 DOM - Sistema de Gestão Doméstica
    `,
  };
};
