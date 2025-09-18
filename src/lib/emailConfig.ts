import nodemailer from 'nodemailer';

// Configuração do Nodemailer com fallback para teste
export const createEmailTransporter = () => {
  const hasGmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  const hasSmtpConfig =
    process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS;

  if (hasGmailConfig) {
    console.log('📧 Configurando Nodemailer com Gmail:', {
      user:
        process.env.EMAIL_USER?.substring(0, 3) +
        '***@' +
        process.env.EMAIL_USER?.split('@')[1],
    });

    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  if (hasSmtpConfig) {
    console.log('📧 Configurando Nodemailer com SMTP personalizado');

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
  console.warn(
    '⚠️ Nenhuma configuração de email encontrada, usando conta de teste'
  );
  console.log('💡 Para usar email real, configure:');
  console.log('- EMAIL_USER e EMAIL_PASS (Gmail)');
  console.log('- Ou SMTP_HOST, SMTP_USER, SMTP_PASS (SMTP personalizado)');

  return nodemailer.createTestAccount().then(testAccount => {
    console.log('📧 Conta de teste criada:', {
      user: testAccount.user,
      pass: testAccount.pass,
      smtp: testAccount.smtp,
      imap: testAccount.imap,
      pop3: testAccount.pop3,
      web: testAccount.web,
    });

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
