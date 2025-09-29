import { NextApiRequest, NextApiResponse } from 'next';
import {
  NotificationService,
  User,
  notificationService,
} from '../../lib/NotificationService';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    try {
      const { userId, email, phone, type, message } = req.body;

      // Validar dados obrigatórios
      if (!userId || !type) {
        return res.status(400).json({
          success: false,
          message: 'userId e type são obrigatórios',
        });
      }

      // Criar usuário de teste
      const user: User = {
        id: userId,
        email: email || 'teste@exemplo.com',
        phone: phone || '+5511999999999',
        name: 'Usuário Teste',
        preferences: {
          userId,
          email: true,
          sms: true,
          push: false,
          inapp: false,
          channels: {},
        },
      };

      // Criar notificação baseada no tipo
      let notification;
      const code = Math.random().toString(36).substr(2, 6).toUpperCase();

      switch (type) {
        case 'email_validation':
          notification = NotificationService.createEmailValidation(user, code);
          break;

        case 'phone_validation':
          notification = NotificationService.createPhoneValidation(user, code);
          break;

        case 'system_alert':
          notification = NotificationService.createSystemAlert(
            user,
            message || 'Alerta de teste do sistema'
          );
          break;

        default:
          notification = {
            userId,
            type: type as any,
            title: 'Teste de Notificação',
            message: message || 'Esta é uma notificação de teste',
            urgency: 'normal' as const,
          };
      }

      // Enviar notificação
      const results = await notificationService.notify(user, notification);

      // Contar sucessos e falhas
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.length - successCount;

      return res.status(200).json({
        success: successCount > 0,
        message: `Notificação processada: ${successCount} sucessos, ${failureCount} falhas`,
        results,
        summary: {
          total: results.length,
          success: successCount,
          failure: failureCount,
          channels: results.map(r => r.channel),
        },
        notification,
        user: {
          id: user.id,
          email: user.email,
          phone: user.phone,
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Erro ao testar notificações:', error);
      return res.status(500).json({
        success: false,
        message: 'Erro interno do servidor',
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }
  } else if (req.method === 'GET') {
    // Retornar informações sobre tipos de notificação disponíveis
    return res.status(200).json({
      success: true,
      message: 'API de teste de notificações',
      types: [
        'email_validation',
        'phone_validation',
        'user_registration',
        'password_reset',
        'system_alert',
        'payment_reminder',
        'document_ready',
      ],
      channels: ['email', 'sms', 'push', 'inapp'],
      example: {
        method: 'POST',
        body: {
          userId: 'user123',
          email: 'usuario@exemplo.com',
          phone: '+5511999999999',
          type: 'system_alert',
          message: 'Mensagem de teste',
        },
      },
      endpoints: {
        test: '/api/test-notifications',
        status: '/api/status-email',
      },
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
