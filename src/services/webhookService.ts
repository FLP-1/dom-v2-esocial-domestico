// Serviço de Webhooks para receber notificações do eSocial em tempo real
// Baseado na documentação oficial do eSocial

export interface WebhookEvent {
  id: string;
  tipo: string;
  protocolo: string;
  status: 'sent' | 'processed' | 'error' | 'rejected';
  dataProcessamento: string;
  mensagem?: string;
  erro?: string;
  xmlRetorno?: string;
  empresaId: string;
  timestamp: string;
}

export interface WebhookConfig {
  url: string;
  secret: string;
  eventos: string[];
  ativo: boolean;
  ultimaVerificacao?: string;
}

export interface WebhookSubscription {
  id: string;
  nome: string;
  url: string;
  eventos: string[];
  ativo: boolean;
  tentativas: number;
  ultimaTentativa?: string;
  proximaTentativa?: string;
}

class WebhookService {
  private subscriptions: WebhookSubscription[] = [];
  private eventQueue: WebhookEvent[] = [];
  private isProcessing = false;
  private retryAttempts = 3;
  private retryDelay = 5000; // 5 segundos

  constructor() {
    this.loadSubscriptions();
    this.startEventProcessor();
  }

  // Configurar webhook
  async configureWebhook(config: WebhookConfig): Promise<boolean> {
    try {
      // Validar URL
      if (!this.isValidUrl(config.url)) {
        throw new Error('URL inválida');
      }

      // Testar conectividade
      const isReachable = await this.testWebhookUrl(config.url);
      if (!isReachable) {
        throw new Error('URL não acessível');
      }

      // Salvar configuração
      const subscription: WebhookSubscription = {
        id: this.generateId(),
        nome: `Webhook ${new Date().toLocaleString('pt-BR')}`,
        url: config.url,
        eventos: config.eventos,
        ativo: config.ativo,
        tentativas: 0,
      };

      this.subscriptions.push(subscription);
      this.saveSubscriptions();

      return true;
    } catch (error) {
      // console.error('Erro ao configurar webhook:', error);
      return false;
    }
  }

  // Processar evento recebido do eSocial
  async processIncomingEvent(event: WebhookEvent): Promise<void> {
    try {
      // Validar evento
      if (!this.isValidEvent(event)) {
        throw new Error('Evento inválido');
      }

      // Adicionar à fila de processamento
      this.eventQueue.push(event);

      // Processar imediatamente se não estiver processando
      if (!this.isProcessing) {
        this.processEventQueue();
      }

      // Salvar evento para auditoria
      this.saveEventForAudit(event);
    } catch (error) {
      // console.error('Erro ao processar evento:', error);
    }
  }

  // Processar fila de eventos
  private async processEventQueue(): Promise<void> {
    if (this.isProcessing || this.eventQueue.length === 0) {
      return;
    }

    this.isProcessing = true;

    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      if (event) {
        await this.distributeEvent(event);
      }
    }

    this.isProcessing = false;
  }

  // Distribuir evento para todos os webhooks ativos
  private async distributeEvent(event: WebhookEvent): Promise<void> {
    const activeSubscriptions = this.subscriptions.filter(
      sub => sub.ativo && sub.eventos.includes(event.tipo)
    );

    const promises = activeSubscriptions.map(subscription =>
      this.sendToWebhook(subscription, event)
    );

    await Promise.allSettled(promises);
  }

  // Enviar evento para webhook específico
  private async sendToWebhook(
    subscription: WebhookSubscription,
    event: WebhookEvent
  ): Promise<void> {
    try {
      const payload = {
        ...event,
        timestamp: new Date().toISOString(),
        signature: this.generateSignature(event, subscription.url),
      };

      const response = await fetch(subscription.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': payload.signature,
          'X-Webhook-Event': event.tipo,
          'User-Agent': 'DOM-eSocial-Webhook/1.0',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Sucesso - resetar tentativas
        subscription.tentativas = 0;
        subscription.ultimaTentativa = new Date().toISOString();
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      // Incrementar tentativas
      subscription.tentativas++;
      subscription.ultimaTentativa = new Date().toISOString();

      if (subscription.tentativas < this.retryAttempts) {
        // Agendar nova tentativa
        subscription.proximaTentativa = new Date(
          Date.now() + this.retryDelay * subscription.tentativas
        ).toISOString();
      } else {
        // Desativar após muitas tentativas
        subscription.ativo = false;
        // console.error(`Webhook ${subscription.id} desativado após ${this.retryAttempts} tentativas`);
      }

      this.saveSubscriptions();
      // console.error(`Erro ao enviar para webhook ${subscription.id}:`, error);
    }
  }

  // Carregar eventos webhook da API
  async loadWebhookEvents(): Promise<void> {
    try {
      const response = await fetch('/api/webhooks/events');
      const result = await response.json();
      
      if (result.success && result.data) {
        this.eventQueue = result.data;
      }
    } catch (error) {
      console.error('Erro ao carregar eventos webhook da API:', error);
    }
  }

  // Processar evento webhook real
  async processWebhookEvent(eventData: any): Promise<void> {
    const webhookEvent: WebhookEvent = {
      id: eventData.id || this.generateId(),
      tipo: eventData.tipo,
      protocolo: eventData.protocolo,
      status: eventData.status,
      dataProcessamento: eventData.dataProcessamento || new Date().toISOString(),
      mensagem: eventData.mensagem,
      erro: eventData.erro,
      empresaId: eventData.empresaId,
      timestamp: eventData.timestamp || new Date().toISOString(),
    };

    await this.processIncomingEvent(webhookEvent);
  }

  // Obter estatísticas dos webhooks
  getWebhookStats(): {
    total: number;
    ativos: number;
    inativos: number;
    comErro: number;
    eventosProcessados: number;
  } {
    const ativos = this.subscriptions.filter(sub => sub.ativo).length;
    const inativos = this.subscriptions.filter(sub => !sub.ativo).length;
    const comErro = this.subscriptions.filter(sub => sub.tentativas > 0).length;

    return {
      total: this.subscriptions.length,
      ativos,
      inativos,
      comErro,
      eventosProcessados: this.eventQueue.length,
    };
  }

  // Obter histórico de eventos
  getEventHistory(): WebhookEvent[] {
    const stored = localStorage.getItem('webhook_events');
    return stored ? JSON.parse(stored) : [];
  }

  // Métodos privados
  private isValidUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  private async testWebhookUrl(url: string): Promise<boolean> {
    try {
      const response = await fetch(url, {
        method: 'HEAD',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private isValidEvent(event: WebhookEvent): boolean {
    return !!(
      event.id &&
      event.tipo &&
      event.protocolo &&
      event.status &&
      event.empresaId
    );
  }

  private generateSignature(event: WebhookEvent, url: string): string {
    // Em produção, usar HMAC com chave secreta
    const payload = JSON.stringify(event);
    return btoa(payload + url + Date.now());
  }

  private generateId(): string {
    return `webhook_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
  }

  private startEventProcessor(): void {
    // Processar fila a cada 5 segundos
    setInterval(() => {
      if (!this.isProcessing && this.eventQueue.length > 0) {
        this.processEventQueue();
      }
    }, 5000);
  }

  private loadSubscriptions(): void {
    const stored = localStorage.getItem('webhook_subscriptions');
    if (stored) {
      this.subscriptions = JSON.parse(stored);
    }
  }

  private saveSubscriptions(): void {
    localStorage.setItem(
      'webhook_subscriptions',
      JSON.stringify(this.subscriptions)
    );
  }

  private saveEventForAudit(event: WebhookEvent): void {
    const stored = localStorage.getItem('webhook_events');
    const events: WebhookEvent[] = stored ? JSON.parse(stored) : [];

    events.unshift(event); // Adicionar no início

    // Manter apenas os últimos 1000 eventos
    if (events.length > 1000) {
      events.splice(1000);
    }

    localStorage.setItem('webhook_events', JSON.stringify(events));
  }
}

// Instância singleton
let webhookServiceInstance: WebhookService | null = null;

export const getWebhookService = (): WebhookService => {
  if (!webhookServiceInstance) {
    webhookServiceInstance = new WebhookService();
  }
  return webhookServiceInstance;
};

export default WebhookService;
