import twilio from 'twilio';

// Tipos para melhor tipagem
export interface SMSResult {
  success: boolean;
  messageId: string;
  status: string;
  direction?: string;
  price?: string;
  timestamp: string;
}

export interface SMSOptions {
  telefone: string;
  codigo?: string;
  message?: string;
  tipo?: 'validacao' | 'confirmacao' | 'alerta';
}

// Configuração do Twilio com fallback para credenciais locais
export const createSMSClient = () => {
  // Usar credenciais das variáveis de ambiente ou fallback para desenvolvimento
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }

  // 📱 Configurando cliente SMS Twilio

  return twilio(accountSid, authToken);
};

// Template de SMS de validação otimizado
export const createValidationSMSTemplate = (
  codigo: string,
  tipo: 'telefone' | 'email' = 'telefone'
) => {
  const tipoTexto = tipo === 'telefone' ? 'Telefone' : 'Email';

  return `🔐 DOM - Validação ${tipoTexto}

Código: ${codigo}

⏰ Expira em 5 min

Não solicitou? Ignore esta mensagem.

© 2024 DOM Sistema`;
};

// Template para SMS de confirmação
export const createConfirmationSMSTemplate = (action: string) => {
  return `✅ DOM - ${action} confirmado!

Sua ação foi processada com sucesso.

© 2024 DOM Sistema`;
};

// Template para SMS de alerta
export const createAlertSMSTemplate = (message: string) => {
  return `⚠️ DOM - Alerta

${message}

Verifique sua conta para mais detalhes.

© 2024 DOM Sistema`;
};

// Função para enviar SMS com validação aprimorada
export const sendSMS = async (telefone: string, codigo: string) => {
  try {
    // 📱 Iniciando envio de SMS

    const client = createSMSClient();
    const message = createValidationSMSTemplate(codigo);

    // Número do Twilio (obrigatório via env)
    const fromNumber = process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      throw new Error('TWILIO_PHONE_NUMBER não configurado nas variáveis de ambiente');
    }

    // Validar formato do telefone (deve estar no formato internacional)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(telefone)) {
      throw new Error(
        'Número de telefone deve estar no formato internacional (+5511999999999)'
      );
    }

    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to: telefone,
    });

    return {
      success: true,
      messageId: result.sid,
      status: result.status,
      direction: result.direction,
      price: result.price,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    // ❌ Erro ao enviar SMS

    // Log detalhado do erro para debug
    if (error instanceof Error) {
      // Detalhes do erro: ${error.message}
    }

    throw error;
  }
};
