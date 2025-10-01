import sgMail from '@sendgrid/mail';

// Tipos para melhor tipagem
export interface TwilioEmailResult {
  success: boolean;
  messageId: string;
  status: string;
  provider: string;
  timestamp: string;
}

export interface TwilioEmailOptions {
  to: string;
  codigo?: string;
  tipo?: 'email' | 'telefone';
  subject?: string;
  customMessage?: string;
}

// Configuração do Twilio SendGrid com fallback
export const configureTwilioEmail = () => {
  const apiKey = process.env.SENDGRID_API_KEY;

  if (!apiKey) {
    // Para usar o sistema real, você precisa configurar SENDGRID_API_KEY
    // Obtenha uma API key em: https://app.sendgrid.com/settings/api_keys
    // ❌ SENDGRID_API_KEY não configurada
    throw new Error('SENDGRID_API_KEY necessária para envio real');
  }

  // 📧 Configurando Twilio SendGrid

  sgMail.setApiKey(apiKey);
  return sgMail;
};

// Template de email para Twilio SendGrid
export const createTwilioEmailTemplate = (
  codigo: string,
  tipo: 'email' | 'telefone'
) => {
  return {
    to: '', // Será definido na chamada
    from: {
      email: process.env.SENDGRID_FROM_EMAIL || 'noreply@dom.com.br',
      name: 'DOM Sistema',
    },
    subject: `🔐 Código de Validação - ${tipo === 'email' ? 'Email' : 'Telefone'}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #29abe2, #1e8bc3); color: white; padding: 30px; text-align: center; }
          .header-title { margin: 0; font-size: 28px; }
          .header-subtitle { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
          .content { padding: 40px 30px; }
          .content-message { font-size: 18px; color: #333; margin-bottom: 20px; }
          .code-box { background: #f8f9fa; border: 3px solid #29abe2; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .code-label { margin: 0 0 15px 0; color: #666; font-size: 16px; }
          .code { font-size: 36px; font-weight: bold; color: #29abe2; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 20px 0; }
          .code-instruction { margin: 15px 0 0 0; color: #666; font-size: 14px; }
          .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .footer-text { margin: 0; }
          .footer-disclaimer { margin: 5px 0 0 0; opacity: 0.7; }
          .support-text { font-size: 14px; color: #666; margin-top: 30px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 class="header-title">🔐 Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}</h1>
            <p class="header-subtitle">DOM - Sistema de Gestão Doméstica</p>
          </div>

          <div class="content">
            <p class="content-message">
              Olá! Você solicitou a validação do seu ${tipo === 'email' ? 'endereço de email' : 'número de telefone'}.
            </p>

            <div class="code-box">
              <p class="code-label">Seu código de validação é:</p>
              <div class="code">${codigo}</div>
              <p class="code-instruction">Digite este código no sistema para continuar</p>
            </div>

            <div class="warning">
              <strong>⏰ Importante:</strong> Este código expira em <strong>5 minutos</strong> por motivos de segurança.
            </div>

            <div class="success">
              <strong>✅ Segurança:</strong> Se você não solicitou esta validação, ignore este email. Sua conta está segura.
            </div>

            <p class="support-text">
              Este é um email automático do sistema DOM. Para suporte, entre em contato conosco.
            </p>
          </div>

          <div class="footer">
            <p class="footer-text">© 2024 DOM - Sistema de Gestão Doméstica</p>
            <p class="footer-disclaimer">Este é um email automático, não responda.</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
      Validação de ${tipo === 'email' ? 'Email' : 'Telefone'} - DOM Sistema

      Seu código de validação é: ${codigo}

      Este código expira em 5 minutos.

      Se você não solicitou esta validação, ignore este email.

      © 2024 DOM - Sistema de Gestão Doméstica
    `,
  };
};

// Função para enviar email via Twilio SendGrid com validação aprimorada
export const sendTwilioEmail = async (
  email: string,
  codigo: string,
  tipo: 'email' | 'telefone' = 'email'
) => {
  try {
    // 📧 Iniciando envio via Twilio SendGrid
    // Email: ${email.substring(0, 3)}***@${email.split('@')[1]}

    // Validar formato do email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error('Formato de email inválido');
    }

    const sgMail = configureTwilioEmail();
    const emailTemplate = createTwilioEmailTemplate(codigo, tipo);

    const msg = {
      ...emailTemplate,
      to: email,
    };

    const result = await sgMail.send(msg);

    return {
      success: true,
      messageId: result[0].headers['x-message-id'] || 'twilio-' + Date.now(),
      status: 'sent',
      provider: 'twilio-sendgrid',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // ❌ Erro ao enviar email via Twilio SendGrid

    // Log detalhado do erro
    if (error instanceof Error) {
      // Detalhes do erro SendGrid: ${error.message}
    }

    throw error;
  }
};
