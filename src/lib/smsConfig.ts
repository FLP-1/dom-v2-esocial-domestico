import twilio from 'twilio';

// Configuração do Twilio
export const createSMSClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// Template de SMS de validação
export const createValidationSMSTemplate = (codigo: string) => {
  return `🔐 DOM - Código de Validação: ${codigo}

Este código expira em 5 minutos.

Se você não solicitou esta validação, ignore esta mensagem.

© 2024 DOM - Sistema de Gestão Doméstica`;
};

// Função para enviar SMS
export const sendSMS = async (telefone: string, codigo: string) => {
  try {
    const client = createSMSClient();
    const message = createValidationSMSTemplate(codigo);

    const result = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER, // Número do Twilio
      to: telefone,
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
    };
  } catch (error) {
    console.error('Erro ao enviar SMS:', error);
    throw error;
  }
};
