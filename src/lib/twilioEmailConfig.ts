import sgMail from '@sendgrid/mail';

// Configuração do Twilio SendGrid
export const configureTwilioEmail = () => {
  if (!process.env.SENDGRID_API_KEY) {
    throw new Error('SENDGRID_API_KEY não configurada');
  }

  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
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
          .content { padding: 40px 30px; }
          .code-box { background: #f8f9fa; border: 3px solid #29abe2; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
          .code { font-size: 36px; font-weight: bold; color: #29abe2; letter-spacing: 8px; font-family: 'Courier New', monospace; margin: 20px 0; }
          .footer { background: #2c3e50; color: white; padding: 20px; text-align: center; font-size: 12px; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; color: #856404; padding: 15px; border-radius: 8px; margin: 20px 0; }
          .success { background: #d4edda; border: 1px solid #c3e6cb; color: #155724; padding: 15px; border-radius: 8px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">🔐 Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">DOM - Sistema de Gestão Doméstica</p>
          </div>

          <div class="content">
            <p style="font-size: 18px; color: #333; margin-bottom: 20px;">
              Olá! Você solicitou a validação do seu ${tipo === 'email' ? 'endereço de email' : 'número de telefone'}.
            </p>

            <div class="code-box">
              <p style="margin: 0 0 15px 0; color: #666; font-size: 16px;">Seu código de validação é:</p>
              <div class="code">${codigo}</div>
              <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">Digite este código no sistema para continuar</p>
            </div>

            <div class="warning">
              <strong>⏰ Importante:</strong> Este código expira em <strong>5 minutos</strong> por motivos de segurança.
            </div>

            <div class="success">
              <strong>✅ Segurança:</strong> Se você não solicitou esta validação, ignore este email. Sua conta está segura.
            </div>

            <p style="font-size: 14px; color: #666; margin-top: 30px;">
              Este é um email automático do sistema DOM. Para suporte, entre em contato conosco.
            </p>
          </div>

          <div class="footer">
            <p style="margin: 0;">© 2024 DOM - Sistema de Gestão Doméstica</p>
            <p style="margin: 5px 0 0 0; opacity: 0.7;">Este é um email automático, não responda.</p>
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

// Função para enviar email via Twilio SendGrid
export const sendTwilioEmail = async (
  email: string,
  codigo: string,
  tipo: 'email' | 'telefone' = 'email'
) => {
  try {
    const sgMail = configureTwilioEmail();
    const emailTemplate = createTwilioEmailTemplate(codigo, tipo);

    const msg = {
      ...emailTemplate,
      to: email,
    };

    const result = await sgMail.send(msg);

    return {
      success: true,
      messageId: result[0].headers['x-message-id'],
      status: 'sent',
    };
  } catch (error) {
    console.error('Erro ao enviar email via Twilio SendGrid:', error);
    throw error;
  }
};
