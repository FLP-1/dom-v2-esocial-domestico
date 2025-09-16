import nodemailer from 'nodemailer';

// Configuração do Nodemailer
export const createEmailTransporter = () => {
  return nodemailer.createTransporter({
    // Gmail (recomendado para desenvolvimento)
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // seu-email@gmail.com
      pass: process.env.EMAIL_PASS, // senha de app do Gmail
    },

    // Alternativa: SMTP personalizado
    // host: process.env.SMTP_HOST,
    // port: parseInt(process.env.SMTP_PORT || '587'),
    // secure: false, // true para 465, false para outras portas
    // auth: {
    //   user: process.env.SMTP_USER,
    //   pass: process.env.SMTP_PASS,
    // },
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
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #29abe2, #1e8bc3); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🔐 Validação de ${tipo === 'email' ? 'Email' : 'Telefone'}</h1>
        </div>

        <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px;">
          <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
            Olá! Você solicitou a validação do seu ${tipo === 'email' ? 'endereço de email' : 'número de telefone'}.
          </p>

          <div style="background: white; border: 2px solid #29abe2; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">Seu código de validação é:</p>
            <div style="font-size: 32px; font-weight: bold; color: #29abe2; letter-spacing: 5px; font-family: monospace;">
              ${codigo}
            </div>
          </div>

          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            ⏰ Este código expira em <strong>5 minutos</strong>
          </p>

          <p style="font-size: 14px; color: #666; margin-bottom: 0;">
            Se você não solicitou esta validação, ignore este email.
          </p>
        </div>

        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>Este é um email automático, não responda.</p>
          <p>© 2024 DOM - Sistema de Gestão Doméstica</p>
        </div>
      </div>
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
