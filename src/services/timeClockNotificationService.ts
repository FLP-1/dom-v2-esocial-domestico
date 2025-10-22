// Serviço de Notificações para Time Clock
// Sistema simplificado para evitar problemas de dependência

export interface TimeClockNotification {
  id: string;
  tipo: 'pending_approval' | 'overtime_request' | 'time_record' | 'geolocation_issue';
  titulo: string;
  mensagem: string;
  timestamp: string;
  lida: boolean;
  prioridade: 'baixa' | 'media' | 'alta' | 'critica';
  dados: {
    registroId?: string;
    usuarioId?: string;
    usuarioNome?: string;
    tipoRegistro?: string;
    endereco?: string;
    precisao?: number;
    observacao?: string;
    horasExtras?: number;
    justificativa?: string;
  };
  acao?: {
    texto: string;
    url?: string;
    callback?: () => void;
  };
}

class TimeClockNotificationService {
  private timeClockNotifications: TimeClockNotification[] = [];

  constructor() {
    this.loadTimeClockNotifications();
  }

  /**
   * Criar notificação para registro pendente de aprovação
   */
  async createPendingApprovalNotification(data: {
    registroId: string;
    usuarioId: string;
    usuarioNome: string;
    tipoRegistro: string;
    endereco: string;
    precisao: number;
    observacao?: string;
  }): Promise<void> {
    const notification: TimeClockNotification = {
      id: this.generateId(),
      tipo: 'pending_approval',
      titulo: 'Registro de Ponto Pendente',
      mensagem: `${data.usuarioNome} registrou ${data.tipoRegistro} e precisa de aprovação. Localização: ${data.endereco}`,
      timestamp: new Date().toISOString(),
      lida: false,
      prioridade: data.precisao > 100 ? 'alta' : 'media',
      dados: {
        registroId: data.registroId,
        usuarioId: data.usuarioId,
        usuarioNome: data.usuarioNome,
        tipoRegistro: data.tipoRegistro,
        endereco: data.endereco,
        precisao: data.precisao,
        observacao: data.observacao,
      },
      acao: {
        texto: 'Aprovar/Rejeitar',
        url: '/time-clock',
        callback: () => {
          // Abrir modal de aprovação
          window.dispatchEvent(new CustomEvent('openPendingApproval'));
        }
      }
    };

    // ✅ Sistema simplificado - apenas armazenar localmente

    // Armazenar notificação específica do time clock
    this.timeClockNotifications.unshift(notification);
    this.saveTimeClockNotifications();
  }

  /**
   * Criar notificação para solicitação de horas extras
   */
  async createOvertimeRequestNotification(data: {
    usuarioId: string;
    usuarioNome: string;
    horasExtras: number;
    justificativa: string;
    data: string;
  }): Promise<void> {
    const notification: TimeClockNotification = {
      id: this.generateId(),
      tipo: 'overtime_request',
      titulo: 'Solicitação de Horas Extras',
      mensagem: `${data.usuarioNome} solicitou ${data.horasExtras}h extras para ${data.data}. Justificativa: ${data.justificativa}`,
      timestamp: new Date().toISOString(),
      lida: false,
      prioridade: 'media',
      dados: {
        usuarioId: data.usuarioId,
        usuarioNome: data.usuarioNome,
        horasExtras: data.horasExtras,
        justificativa: data.justificativa,
      },
      acao: {
        texto: 'Aprovar Horas Extras',
        url: '/time-clock',
        callback: () => {
          // Abrir modal de aprovação de horas extras
          window.dispatchEvent(new CustomEvent('openOvertimeApproval'));
        }
      }
    };

    // ✅ Sistema simplificado - apenas armazenar localmente

    this.timeClockNotifications.unshift(notification);
    this.saveTimeClockNotifications();
  }

  /**
   * Criar notificação para problema de geolocalização
   */
  async createGeolocationIssueNotification(data: {
    usuarioId: string;
    usuarioNome: string;
    precisao: number;
    endereco: string;
    tipoRegistro: string;
  }): Promise<void> {
    const isHighPrecision = data.precisao > 500; // Mais de 500m é impreciso
    
    const notification: TimeClockNotification = {
      id: this.generateId(),
      tipo: 'geolocation_issue',
      titulo: isHighPrecision ? 'Geolocalização Imprecisa' : 'Registro com Localização',
      mensagem: `${data.usuarioNome} registrou ${data.tipoRegistro} com precisão de ${Math.round(data.precisao)}m em ${data.endereco}`,
      timestamp: new Date().toISOString(),
      lida: false,
      prioridade: isHighPrecision ? 'alta' : 'baixa',
      dados: {
        usuarioId: data.usuarioId,
        usuarioNome: data.usuarioNome,
        tipoRegistro: data.tipoRegistro,
        endereco: data.endereco,
        precisao: data.precisao,
      }
    };

    // ✅ Sistema simplificado - apenas armazenar localmente

    this.timeClockNotifications.unshift(notification);
    this.saveTimeClockNotifications();
  }

  /**
   * Marcar notificação como lida
   */
  markAsRead(notificationId: string): void {
    const notification = this.timeClockNotifications.find(n => n.id === notificationId);
    if (notification) {
      notification.lida = true;
      this.saveTimeClockNotifications();
    }
  }

  /**
   * Obter notificações não lidas
   */
  getUnreadNotifications(): TimeClockNotification[] {
    return this.timeClockNotifications.filter(n => !n.lida);
  }

  /**
   * Obter contador de notificações pendentes
   */
  getPendingCount(): number {
    return this.timeClockNotifications.filter(n => !n.lida).length;
  }

  /**
   * Obter notificações por tipo
   */
  getNotificationsByType(tipo: TimeClockNotification['tipo']): TimeClockNotification[] {
    return this.timeClockNotifications.filter(n => n.tipo === tipo);
  }

  /**
   * Limpar notificações antigas (manter apenas últimas 100)
   */
  cleanupOldNotifications(): void {
    if (this.timeClockNotifications.length > 100) {
      this.timeClockNotifications = this.timeClockNotifications.slice(0, 100);
      this.saveTimeClockNotifications();
    }
  }

  /**
   * Gerar ID único
   */
  private generateId(): string {
    return `tc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Salvar notificações no localStorage
   */
  private saveTimeClockNotifications(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('timeClockNotifications', JSON.stringify(this.timeClockNotifications));
    }
  }

  /**
   * Carregar notificações do localStorage
   */
  loadTimeClockNotifications(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('timeClockNotifications');
      if (stored) {
        try {
          this.timeClockNotifications = JSON.parse(stored);
        } catch (error) {
          console.error('Erro ao carregar notificações do time clock:', error);
          this.timeClockNotifications = [];
        }
      }
    }
  }
}

// Singleton instance
export const timeClockNotificationService = new TimeClockNotificationService();

export default timeClockNotificationService;
