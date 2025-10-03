// Serviço de Notificações em Tempo Real para o Sistema DOM
// Integra com webhooks, auditoria e monitoramento

export interface Notification {
  id: string;
  tipo: 'info' | 'success' | 'warning' | 'error' | 'critical';
  titulo: string;
  mensagem: string;
  timestamp: string;
  lida: boolean;
  acao?: {
    texto: string;
    url?: string;
    callback?: () => void;
  };
  categoria: 'esocial' | 'backup' | 'webhook' | 'auditoria' | 'sistema';
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  usuario?: string;
  dados?: any;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  inApp: boolean;
  categorias: {
    esocial: boolean;
    backup: boolean;
    webhook: boolean;
    auditoria: boolean;
    sistema: boolean;
  };
  frequencia: 'imediato' | 'diario' | 'semanal';
}

class NotificationService {
  private notifications: Notification[] = [];
  private preferences: NotificationPreferences;
  private listeners: ((notifications: Notification[]) => void)[] = [];
  private isConnected = false;

  constructor() {
    this.preferences = this.loadPreferences();
    this.loadNotifications();
    this.startConnection();
  }

  // Conectar ao sistema de notificações
  private startConnection(): void {
    // Simular conexão WebSocket (em produção usar WebSocket real)
    this.simulateConnection();
  }

  private simulateConnection(): void {
    this.isConnected = true;

    // Simular notificações periódicas
    setInterval(() => {
      if (this.isConnected) {
        // this.generateMockNotifications(); // Método não implementado
      }
    }, 30000); // A cada 30 segundos
  }

  // Enviar notificação
  async sendNotification(
    notification: Omit<Notification, 'id' | 'timestamp' | 'lida'>
  ): Promise<void> {
    const newNotification: Notification = {
      ...notification,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      lida: false,
    };

    this.notifications.unshift(newNotification);

    // Manter apenas as últimas 1000 notificações
    if (this.notifications.length > 1000) {
      this.notifications = this.notifications.slice(0, 1000);
    }

    this.saveNotifications();
    this.notifyListeners();

    // Enviar por email se habilitado
    if (this.preferences.email && this.shouldSendEmail(newNotification)) {
      await this.sendEmailNotification(newNotification);
    }

    // Enviar push notification se habilitado
    if (this.preferences.push && this.shouldSendPush(newNotification)) {
      await this.sendPushNotification(newNotification);
    }
  }

  // Marcar notificação como lida
  markAsRead(notificationId: string): void {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.lida = true;
      this.saveNotifications();
      this.notifyListeners();
    }
  }

  // Marcar todas como lidas
  markAllAsRead(): void {
    this.notifications.forEach(n => (n.lida = true));
    this.saveNotifications();
    this.notifyListeners();
  }

  // Obter notificações
  getNotifications(filtros?: {
    categoria?: string;
    tipo?: string;
    lida?: boolean;
    limite?: number;
  }): Notification[] {
    let filtered = [...this.notifications];

    if (filtros?.categoria) {
      filtered = filtered.filter(n => n.categoria === filtros.categoria);
    }

    if (filtros?.tipo) {
      filtered = filtered.filter(n => n.tipo === filtros.tipo);
    }

    if (filtros?.lida !== undefined) {
      filtered = filtered.filter(n => n.lida === filtros.lida);
    }

    if (filtros?.limite) {
      filtered = filtered.slice(0, filtros.limite);
    }

    return filtered;
  }

  // Obter estatísticas
  getStats(): {
    total: number;
    naoLidas: number;
    porTipo: Record<string, number>;
    porCategoria: Record<string, number>;
  } {
    const naoLidas = this.notifications.filter(n => !n.lida).length;

    const porTipo = this.notifications.reduce(
      (acc, n) => {
        acc[n.tipo] = (acc[n.tipo] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const porCategoria = this.notifications.reduce(
      (acc, n) => {
        acc[n.categoria] = (acc[n.categoria] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: this.notifications.length,
      naoLidas,
      porTipo,
      porCategoria,
    };
  }

  // Configurar preferências
  updatePreferences(preferences: Partial<NotificationPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
    this.savePreferences();
  }

  // Obter preferências
  getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  // Adicionar listener para mudanças
  addListener(callback: (notifications: Notification[]) => void): () => void {
    this.listeners.push(callback);

    // Retornar função para remover listener
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notificar listeners
  private notifyListeners(): void {
    this.listeners.forEach(callback => callback([...this.notifications]));
  }

  // Carregar notificações da API
  private async loadNotificationsFromAPI(): Promise<void> {
    try {
      const response = await fetch('/api/notifications');
      const result = await response.json();
      
      if (result.success && result.data) {
        const apiNotifications = result.data.map((item: any) => ({
          id: item.id,
          tipo: item.tipo,
          titulo: item.titulo,
          mensagem: item.mensagem,
          categoria: item.categoria,
          prioridade: item.prioridade,
          lida: item.lida,
          enviada: item.enviada,
          dataEnvio: item.dataEnvio,
          dataLeitura: item.dataLeitura,
          dataExpiracao: item.dataExpiracao,
        }));
        
        this.notifications = apiNotifications;
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Erro ao carregar notificações da API:', error);
    }
  }

  // Verificar se deve enviar email
  private shouldSendEmail(notification: Notification): boolean {
    return (
      notification.prioridade === 'critica' ||
      notification.prioridade === 'alta' ||
      (this.preferences.frequencia === 'imediato' &&
        notification.prioridade === 'media')
    );
  }

  // Verificar se deve enviar push
  private shouldSendPush(notification: Notification): boolean {
    return (
      notification.prioridade === 'critica' ||
      notification.prioridade === 'alta'
    );
  }

  // Enviar email (simulado)
  private async sendEmailNotification(
    _notification: Notification
  ): Promise<void> {
    // Em produção, integrar com serviço de email
    //
  }

  // Enviar push notification (simulado)
  private async sendPushNotification(
    notification: Notification
  ): Promise<void> {
    // Em produção, usar Service Worker e Push API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(notification.titulo, {
        body: notification.mensagem,
        icon: '/favicon.ico',
        tag: notification.id,
      });
    }
  }

  // Solicitar permissão para notificações
  async requestPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  // Limpar notificações antigas
  cleanupOldNotifications(diasRetencao: number = 30): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - diasRetencao);

    this.notifications = this.notifications.filter(
      n => new Date(n.timestamp) >= cutoffDate
    );

    this.saveNotifications();
    this.notifyListeners();
  }

  // Métodos utilitários
  private generateId(): string {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadPreferences(): NotificationPreferences {
    const stored = localStorage.getItem('notification_preferences');
    return stored
      ? JSON.parse(stored)
      : {
          email: true,
          push: true,
          inApp: true,
          categorias: {
            esocial: true,
            backup: true,
            webhook: true,
            auditoria: true,
            sistema: true,
          },
          frequencia: 'imediato',
        };
  }

  private savePreferences(): void {
    localStorage.setItem(
      'notification_preferences',
      JSON.stringify(this.preferences)
    );
  }

  private async loadNotifications(): Promise<void> {
    // Primeiro tenta carregar da API
    await this.loadNotificationsFromAPI();
    
    // Se não conseguir da API, carrega do localStorage como fallback
    if (this.notifications.length === 0) {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
      }
    }
  }

  private saveNotifications(): void {
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }
}

// Instância singleton
let notificationServiceInstance: NotificationService | null = null;

export const getNotificationService = (): NotificationService => {
  if (!notificationServiceInstance) {
    notificationServiceInstance = new NotificationService();
  }
  return notificationServiceInstance;
};

export default NotificationService;
