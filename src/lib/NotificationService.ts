import { emailService } from './emailService';
import { sendSMS } from './smsConfig';

// Tipos de notificação
export type NotificationType =
  | 'email_validation'
  | 'phone_validation'
  | 'user_registration'
  | 'password_reset'
  | 'system_alert'
  | 'payment_reminder'
  | 'document_ready';

// Canais de notificação
export type NotificationChannel = 'email' | 'sms' | 'push' | 'inapp';

// Preferências do usuário
export interface UserNotificationPreferences {
  userId: string;
  email: boolean;
  sms: boolean;
  push: boolean;
  inapp: boolean;
  channels: {
    [key in NotificationType]?: NotificationChannel[];
  };
}

// Dados da notificação
export interface NotificationData {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  urgency: 'low' | 'normal' | 'high' | 'critical';
  channels?: NotificationChannel[];
}

// Resultado do envio
export interface NotificationResult {
  success: boolean;
  channel: NotificationChannel;
  messageId?: string;
  error?: string;
  timestamp: string;
}

// Usuário básico
export interface User {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  preferences?: UserNotificationPreferences;
}

/**
 * Serviço centralizado de notificações
 * Gerencia envio via SMS, Email e futuramente Push/In-App
 */
export class NotificationService {
  private static instance: NotificationService;

  // Configurações padrão por tipo de notificação
  private defaultChannels: Record<NotificationType, NotificationChannel[]> = {
    email_validation: ['email'],
    phone_validation: ['sms'],
    user_registration: ['email'],
    password_reset: ['email', 'sms'],
    system_alert: ['email', 'sms'],
    payment_reminder: ['email'],
    document_ready: ['email'],
  };

  // Singleton pattern
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Enviar notificação para um usuário
   */
  async notify(
    user: User,
    notification: NotificationData
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = [];

    try {
      console.log(
        `📢 Enviando notificação para usuário ${user.id}: ${notification.type}`
      );

      // Determinar canais a usar
      const channels = this.determineChannels(user, notification);
      console.log(`📊 Canais selecionados:`, channels);

      // Enviar por cada canal
      for (const channel of channels) {
        try {
          const result = await this.sendToChannel(user, notification, channel);
          results.push(result);
        } catch (error) {
          results.push({
            success: false,
            channel,
            error: error instanceof Error ? error.message : 'Erro desconhecido',
            timestamp: new Date().toISOString(),
          });
        }
      }

      // Log do resultado
      const successCount = results.filter(r => r.success).length;
      console.log(
        `✅ Notificação enviada: ${successCount}/${results.length} canais com sucesso`
      );

      return results;
    } catch (error) {
      console.error('Erro no NotificationService:', error);
      throw error;
    }
  }

  /**
   * Determinar quais canais usar baseado nas preferências do usuário
   */
  private determineChannels(
    user: User,
    notification: NotificationData
  ): NotificationChannel[] {
    // Se canais foram especificados na notificação, usar eles
    if (notification.channels && notification.channels.length > 0) {
      return notification.channels;
    }

    // Usar preferências do usuário se disponíveis
    if (user.preferences?.channels?.[notification.type]) {
      return user.preferences.channels[notification.type]!;
    }

    // Usar configuração padrão do tipo de notificação
    const defaultChannels = this.defaultChannels[notification.type] || [
      'email',
    ];

    // Filtrar canais baseado nas preferências gerais do usuário
    return defaultChannels.filter(channel => {
      if (!user.preferences) return true;

      switch (channel) {
        case 'email':
          return user.preferences.email !== false && !!user.email;
        case 'sms':
          return user.preferences.sms !== false && !!user.phone;
        case 'push':
          return user.preferences.push !== false;
        case 'inapp':
          return user.preferences.inapp !== false;
        default:
          return true;
      }
    });
  }

  /**
   * Enviar notificação por um canal específico
   */
  private async sendToChannel(
    user: User,
    notification: NotificationData,
    channel: NotificationChannel
  ): Promise<NotificationResult> {
    const timestamp = new Date().toISOString();

    switch (channel) {
      case 'email':
        return await this.sendEmail(user, notification, timestamp);

      case 'sms':
        return await this.sendSMS(user, notification, timestamp);

      case 'push':
        return await this.sendPush(user, notification, timestamp);

      case 'inapp':
        return await this.sendInApp(user, notification, timestamp);

      default:
        throw new Error(`Canal não suportado: ${channel}`);
    }
  }

  /**
   * Enviar por email
   */
  private async sendEmail(
    user: User,
    notification: NotificationData,
    timestamp: string
  ): Promise<NotificationResult> {
    if (!user.email) {
      throw new Error('Usuário não tem email configurado');
    }

    try {
      const result = await emailService.sendValidationEmail(
        user.email,
        this.generateCode(),
        'email'
      );

      return {
        success: true,
        channel: 'email',
        messageId: result.messageId,
        timestamp,
      };
    } catch (error) {
      throw new Error(
        `Erro ao enviar email: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Enviar por SMS
   */
  private async sendSMS(
    user: User,
    notification: NotificationData,
    timestamp: string
  ): Promise<NotificationResult> {
    if (!user.phone) {
      throw new Error('Usuário não tem telefone configurado');
    }

    try {
      const result = await sendSMS(user.phone, this.generateCode());

      return {
        success: true,
        channel: 'sms',
        messageId: result.messageId,
        timestamp,
      };
    } catch (error) {
      throw new Error(
        `Erro ao enviar SMS: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      );
    }
  }

  /**
   * Enviar push notification (placeholder para Firebase)
   */
  private async sendPush(
    user: User,
    notification: NotificationData,
    timestamp: string
  ): Promise<NotificationResult> {
    // TODO: Implementar com Firebase quando necessário
    console.log(
      '📱 Push notification seria enviado aqui (Firebase não configurado)'
    );

    return {
      success: true,
      channel: 'push',
      messageId: 'push-' + Date.now(),
      timestamp,
    };
  }

  /**
   * Enviar notificação in-app (placeholder)
   */
  private async sendInApp(
    user: User,
    notification: NotificationData,
    timestamp: string
  ): Promise<NotificationResult> {
    // TODO: Implementar sistema in-app
    console.log('🔔 Notificação in-app seria salva no banco aqui');

    return {
      success: true,
      channel: 'inapp',
      messageId: 'inapp-' + Date.now(),
      timestamp,
    };
  }

  /**
   * Gerar código de validação
   */
  private generateCode(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  /**
   * Criar notificação de validação de email
   */
  static createEmailValidation(user: User, code: string): NotificationData {
    return {
      userId: user.id,
      type: 'email_validation',
      title: 'Validação de Email',
      message: `Seu código de validação é: ${code}`,
      data: { code },
      urgency: 'normal',
      channels: ['email'],
    };
  }

  /**
   * Criar notificação de validação de telefone
   */
  static createPhoneValidation(user: User, code: string): NotificationData {
    return {
      userId: user.id,
      type: 'phone_validation',
      title: 'Validação de Telefone',
      message: `Seu código de validação é: ${code}`,
      data: { code },
      urgency: 'normal',
      channels: ['sms'],
    };
  }

  /**
   * Criar notificação de alerta do sistema
   */
  static createSystemAlert(user: User, message: string): NotificationData {
    return {
      userId: user.id,
      type: 'system_alert',
      title: 'Alerta do Sistema',
      message,
      urgency: 'high',
      channels: ['email', 'sms'],
    };
  }
}

// Instância singleton
export const notificationService = NotificationService.getInstance();
