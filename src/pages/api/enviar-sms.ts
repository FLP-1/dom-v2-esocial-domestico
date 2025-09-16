import { NextApiRequest, NextApiResponse } from 'next';
import { sendSMS } from '../../lib/smsConfig';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { telefone, codigo } = req.body;

      console.log(`📱 Enviando SMS para: ${telefone}`);
      console.log(`Código de validação: ${codigo}`);

      // Validar dados de entrada
      if (!telefone || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Telefone e código são obrigatórios',
        });
      }

      // Verificar se as credenciais do Twilio estão configuradas
      if (
        !process.env.TWILIO_ACCOUNT_SID ||
        !process.env.TWILIO_AUTH_TOKEN ||
        !process.env.TWILIO_PHONE_NUMBER
      ) {
        console.warn(
          '⚠️ Credenciais do Twilio não configuradas, usando modo simulação'
        );

        // Modo simulação para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 1000));

        return res.status(200).json({
          success: true,
          message: 'SMS simulado enviado (credenciais não configuradas)',
          codigo,
          telefone,
          modo: 'simulação',
          timestamp: new Date().toISOString(),
        });
      }

      // Envio real de SMS
      const result = await sendSMS(telefone, codigo);

      console.log(`✅ SMS enviado com sucesso para: ${telefone}`);
      console.log(`Message ID: ${result.messageId}`);

      return res.status(200).json({
        success: true,
        message: 'SMS enviado com sucesso',
        codigo,
        telefone,
        messageId: result.messageId,
        status: result.status,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao enviar SMS:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao enviar SMS',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
