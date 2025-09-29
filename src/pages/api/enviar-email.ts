import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../lib/emailService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { email, codigo, tipo = 'email' } = req.body;

      // Validar dados de entrada
      if (!email || !codigo) {
        return res.status(400).json({
          success: false,
          message: 'Email e código são obrigatórios',
        });
      }

      // Verificar status dos provedores
      const providerStatus = emailService.getProviderStatus();

      // Se nenhum provedor estiver configurado, usar modo simulação
      if (
        !providerStatus.twilio.configured &&
        !providerStatus.nodemailer.configured
      ) {
        console.warn(
          '⚠️ Nenhum provedor de email configurado, usando modo simulação'
        );

        // Modo simulação para desenvolvimento
        await new Promise(resolve => setTimeout(resolve, 1000));

        return res.status(200).json({
          success: true,
          message: 'Email simulado enviado (nenhum provedor configurado)',
          codigo,
          email,
          modo: 'simulação',
          providers: providerStatus,
          timestamp: new Date().toISOString(),
        });
      }

      // Envio real de email usando o serviço híbrido
      const result = await emailService.sendValidationEmail(
        email,
        codigo,
        tipo
      );

      return res.status(200).json({
        success: true,
        message: result.message,
        codigo,
        email,
        provider: result.provider,
        messageId: result.messageId,
        providers: providerStatus,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao enviar email:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor ao enviar email',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
