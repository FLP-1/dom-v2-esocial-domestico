import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../lib/emailService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const status = emailService.getProviderStatus();

      return res.status(200).json({
        success: true,
        providers: status,
        recommendation: {
          message: status.allConfigured
            ? 'Ambos os provedores configurados. Twilio SendGrid será usado por padrão.'
            : status.twilio.configured
              ? 'Twilio SendGrid configurado e será usado.'
              : status.nodemailer.configured
                ? 'Nodemailer configurado e será usado.'
                : 'Nenhum provedor configurado. Modo simulação ativo.',
          priority: ['twilio', 'nodemailer', 'simulation'],
        },
        setup: {
          twilio: {
            required: ['SENDGRID_API_KEY'],
            optional: ['SENDGRID_FROM_EMAIL'],
            instructions: 'Configure SENDGRID_API_KEY no .env.local',
          },
          nodemailer: {
            required: ['EMAIL_USER', 'EMAIL_PASS'],
            instructions: 'Configure EMAIL_USER e EMAIL_PASS no .env.local',
          },
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro ao verificar status dos provedores',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
