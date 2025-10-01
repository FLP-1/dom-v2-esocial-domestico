// Serviço de Recuperação de Erros para o Sistema DOM
// Detecta, analisa e recupera automaticamente de erros

export interface ErrorInfo {
  id: string;
  timestamp: string;
  tipo:
    | 'network'
    | 'validation'
    | 'authentication'
    | 'permission'
    | 'system'
    | 'unknown';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  mensagem: string;
  stack?: string;
  contexto: {
    usuario?: string;
    acao?: string;
    recurso?: string;
    dados?: any;
  };
  status: 'ativo' | 'resolvido' | 'ignorado';
  tentativas: number;
  ultimaTentativa?: string;
  solucao?: string;
}

export interface RecoveryAction {
  id: string;
  tipo: 'retry' | 'fallback' | 'notification' | 'rollback' | 'manual';
  descricao: string;
  executada: boolean;
  resultado?: 'sucesso' | 'falha' | 'pendente';
  timestamp?: string;
  detalhes?: any;
}

export interface RecoveryStrategy {
  id: string;
  nome: string;
  descricao: string;
  condicoes: {
    tipo?: string;
    severidade?: string;
    tentativas?: number;
    tempoLimite?: number; // em minutos
  };
  acoes: RecoveryAction[];
  ativo: boolean;
}

class ErrorRecoveryService {
  private errors: ErrorInfo[] = [];
  private strategies: RecoveryStrategy[] = [];
  private isMonitoring = false;
  private maxRetries = 3;
  private retryDelay = 5000; // 5 segundos

  constructor() {
    this.loadErrors();
    this.loadStrategies();
    this.initializeDefaultStrategies();
    this.startMonitoring();
  }

  // Registrar erro
  async registerError(
    error: Error,
    contexto: {
      usuario?: string;
      acao?: string;
      recurso?: string;
      dados?: any;
    } = {}
  ): Promise<ErrorInfo> {
    const errorInfo: ErrorInfo = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      tipo: this.categorizeError(error),
      severidade: this.assessSeverity(error),
      mensagem: error.message,
      ...(error.stack && { stack: error.stack }),
      contexto,
      status: 'ativo',
      tentativas: 0,
    };

    this.errors.unshift(errorInfo);

    // Manter apenas os últimos 1000 erros
    if (this.errors.length > 1000) {
      this.errors = this.errors.slice(0, 1000);
    }

    this.saveErrors();

    // Tentar recuperação automática
    await this.attemptRecovery(errorInfo);

    return errorInfo;
  }

  // Tentar recuperação automática
  private async attemptRecovery(errorInfo: ErrorInfo): Promise<void> {
    const strategy = this.findMatchingStrategy(errorInfo);

    if (!strategy) {
      // console.warn('Nenhuma estratégia de recuperação encontrada para o erro:', errorInfo.id);
      return;
    }

    errorInfo.tentativas++;
    errorInfo.ultimaTentativa = new Date().toISOString();

    try {
      for (const action of strategy.acoes) {
        if (!action.executada) {
          await this.executeRecoveryAction(action, errorInfo);
        }
      }

      // Se todas as ações foram executadas com sucesso
      if (strategy.acoes.every(a => a.resultado === 'sucesso')) {
        errorInfo.status = 'resolvido';
        errorInfo.solucao = 'Recuperação automática bem-sucedida';
      }
    } catch (recoveryError) {
      // console.error('Erro durante recuperação:', recoveryError);

      if (errorInfo.tentativas >= this.maxRetries) {
        errorInfo.status = 'ignorado';
        errorInfo.solucao = 'Máximo de tentativas atingido';
      }
    }

    this.updateError(errorInfo);
    this.saveErrors();
  }

  // Executar ação de recuperação
  private async executeRecoveryAction(
    action: RecoveryAction,
    errorInfo: ErrorInfo
  ): Promise<void> {
    action.executada = true;
    action.timestamp = new Date().toISOString();

    try {
      switch (action.tipo) {
        case 'retry':
          await this.retryOperation(errorInfo);
          action.resultado = 'sucesso';
          break;

        case 'fallback':
          await this.executeFallback(errorInfo);
          action.resultado = 'sucesso';
          break;

        case 'notification':
          await this.sendErrorNotification(errorInfo);
          action.resultado = 'sucesso';
          break;

        case 'rollback':
          await this.executeRollback(errorInfo);
          action.resultado = 'sucesso';
          break;

        case 'manual':
          action.resultado = 'pendente';
          break;

        default:
          action.resultado = 'falha';
      }
    } catch (actionError) {
      action.resultado = 'falha';
      action.detalhes =
        actionError instanceof Error
          ? actionError.message
          : 'Erro desconhecido';
    }
  }

  // Tentar novamente a operação
  private async retryOperation(_errorInfo: ErrorInfo): Promise<void> {
    // Simular retry com delay
    await new Promise(resolve => setTimeout(resolve, this.retryDelay));

    // Em produção, reexecutar a operação original
    //
  }

  // Executar fallback
  private async executeFallback(errorInfo: ErrorInfo): Promise<void> {
    // Implementar lógica de fallback baseada no tipo de erro
    switch (errorInfo.tipo) {
      case 'network':
        // Tentar conexão alternativa
        //
        break;
      case 'authentication':
        // Tentar reautenticação
        //
        break;
      case 'validation':
        // Usar dados padrão
        //
        break;
      default:
      //
    }
  }

  // Enviar notificação de erro
  private async sendErrorNotification(_errorInfo: ErrorInfo): Promise<void> {
    // Integrar com serviço de notificações
    //
  }

  // Executar rollback
  private async executeRollback(_errorInfo: ErrorInfo): Promise<void> {
    // Implementar lógica de rollback
    //
  }

  // Categorizar erro
  private categorizeError(error: Error): ErrorInfo['tipo'] {
    const message = error.message.toLowerCase();

    if (
      message.includes('network') ||
      message.includes('fetch') ||
      message.includes('timeout')
    ) {
      return 'network';
    }

    if (
      message.includes('validation') ||
      message.includes('invalid') ||
      message.includes('required')
    ) {
      return 'validation';
    }

    if (
      message.includes('auth') ||
      message.includes('token') ||
      message.includes('unauthorized')
    ) {
      return 'authentication';
    }

    if (
      message.includes('permission') ||
      message.includes('forbidden') ||
      message.includes('access')
    ) {
      return 'permission';
    }

    if (
      message.includes('system') ||
      message.includes('internal') ||
      message.includes('server')
    ) {
      return 'system';
    }

    return 'unknown';
  }

  // Avaliar severidade
  private assessSeverity(error: Error): ErrorInfo['severidade'] {
    const message = error.message.toLowerCase();

    if (
      message.includes('critical') ||
      message.includes('fatal') ||
      message.includes('security')
    ) {
      return 'critica';
    }

    if (
      message.includes('error') ||
      message.includes('failed') ||
      message.includes('exception')
    ) {
      return 'alta';
    }

    if (message.includes('warning') || message.includes('caution')) {
      return 'media';
    }

    return 'baixa';
  }

  // Encontrar estratégia correspondente
  private findMatchingStrategy(
    errorInfo: ErrorInfo
  ): RecoveryStrategy | undefined {
    return this.strategies.find(strategy => {
      if (!strategy.ativo) return false;

      const condicoes = strategy.condicoes;

      if (condicoes.tipo && condicoes.tipo !== errorInfo.tipo) return false;
      if (condicoes.severidade && condicoes.severidade !== errorInfo.severidade)
        return false;
      if (condicoes.tentativas && errorInfo.tentativas > condicoes.tentativas)
        return false;

      if (condicoes.tempoLimite) {
        const errorTime = new Date(errorInfo.timestamp).getTime();
        const now = new Date().getTime();
        const timeDiff = (now - errorTime) / (1000 * 60); // em minutos

        if (timeDiff > condicoes.tempoLimite) return false;
      }

      return true;
    });
  }

  // Inicializar estratégias padrão
  private initializeDefaultStrategies(): void {
    if (this.strategies.length === 0) {
      const defaultStrategies: Omit<RecoveryStrategy, 'id'>[] = [
        {
          nome: 'Recuperação de Rede',
          descricao: 'Tenta reconectar em caso de erros de rede',
          condicoes: {
            tipo: 'network',
            tentativas: 3,
          },
          acoes: [
            {
              id: 'retry_1',
              tipo: 'retry',
              descricao: 'Tentar novamente a conexão',
              executada: false,
            },
            {
              id: 'fallback_1',
              tipo: 'fallback',
              descricao: 'Usar conexão alternativa',
              executada: false,
            },
          ],
          ativo: true,
        },
        {
          nome: 'Recuperação de Autenticação',
          descricao: 'Reautentica usuário em caso de erro de token',
          condicoes: {
            tipo: 'authentication',
            tentativas: 2,
          },
          acoes: [
            {
              id: 'retry_auth',
              tipo: 'retry',
              descricao: 'Tentar reautenticação',
              executada: false,
            },
            {
              id: 'notify_auth',
              tipo: 'notification',
              descricao: 'Notificar sobre problema de autenticação',
              executada: false,
            },
          ],
          ativo: true,
        },
        {
          nome: 'Recuperação de Validação',
          descricao: 'Usa dados padrão em caso de erro de validação',
          condicoes: {
            tipo: 'validation',
            tentativas: 1,
          },
          acoes: [
            {
              id: 'fallback_validation',
              tipo: 'fallback',
              descricao: 'Usar dados padrão',
              executada: false,
            },
          ],
          ativo: true,
        },
        {
          nome: 'Recuperação Crítica',
          descricao: 'Ações para erros críticos',
          condicoes: {
            severidade: 'critica',
          },
          acoes: [
            {
              id: 'notify_critical',
              tipo: 'notification',
              descricao: 'Notificar imediatamente',
              executada: false,
            },
            {
              id: 'rollback_critical',
              tipo: 'rollback',
              descricao: 'Executar rollback se necessário',
              executada: false,
            },
          ],
          ativo: true,
        },
      ];

      defaultStrategies.forEach(strategy => {
        this.createStrategy(strategy);
      });
    }
  }

  // Criar estratégia
  createStrategy(strategy: Omit<RecoveryStrategy, 'id'>): RecoveryStrategy {
    const newStrategy: RecoveryStrategy = {
      ...strategy,
      id: this.generateId(),
    };

    this.strategies.push(newStrategy);
    this.saveStrategies();

    return newStrategy;
  }

  // Obter erros
  getErrors(filtros?: {
    tipo?: string;
    severidade?: string;
    status?: string;
    limite?: number;
  }): ErrorInfo[] {
    let filtered = [...this.errors];

    if (filtros?.tipo) {
      filtered = filtered.filter(e => e.tipo === filtros.tipo);
    }

    if (filtros?.severidade) {
      filtered = filtered.filter(e => e.severidade === filtros.severidade);
    }

    if (filtros?.status) {
      filtered = filtered.filter(e => e.status === filtros.status);
    }

    if (filtros?.limite) {
      filtered = filtered.slice(0, filtros.limite);
    }

    return filtered;
  }

  // Obter estatísticas
  getStats(): {
    total: number;
    ativos: number;
    resolvidos: number;
    porTipo: Record<string, number>;
    porSeveridade: Record<string, number>;
  } {
    const ativos = this.errors.filter(e => e.status === 'ativo').length;
    const resolvidos = this.errors.filter(e => e.status === 'resolvido').length;

    const porTipo = this.errors.reduce(
      (acc, e) => {
        acc[e.tipo] = (acc[e.tipo] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const porSeveridade = this.errors.reduce(
      (acc, e) => {
        acc[e.severidade] = (acc[e.severidade] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return {
      total: this.errors.length,
      ativos,
      resolvidos,
      porTipo,
      porSeveridade,
    };
  }

  // Iniciar monitoramento
  private startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitorar erros não resolvidos a cada 5 minutos
    setInterval(
      () => {
        this.monitorUnresolvedErrors();
      },
      5 * 60 * 1000
    );
  }

  // Monitorar erros não resolvidos
  private monitorUnresolvedErrors(): void {
    const unresolvedErrors = this.errors.filter(
      e => e.status === 'ativo' && e.tentativas < this.maxRetries
    );

    unresolvedErrors.forEach(error => {
      const timeSinceLastAttempt = error.ultimaTentativa
        ? new Date().getTime() - new Date(error.ultimaTentativa).getTime()
        : new Date().getTime() - new Date(error.timestamp).getTime();

      // Tentar novamente se passou tempo suficiente
      if (timeSinceLastAttempt > this.retryDelay) {
        this.attemptRecovery(error);
      }
    });
  }

  // Métodos utilitários
  private generateId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateError(errorInfo: ErrorInfo): void {
    const index = this.errors.findIndex(e => e.id === errorInfo.id);
    if (index >= 0) {
      this.errors[index] = errorInfo;
    }
  }

  private loadErrors(): void {
    const stored = localStorage.getItem('error_recovery_errors');
    if (stored) {
      this.errors = JSON.parse(stored);
    }
  }

  private saveErrors(): void {
    localStorage.setItem('error_recovery_errors', JSON.stringify(this.errors));
  }

  private loadStrategies(): void {
    const stored = localStorage.getItem('error_recovery_strategies');
    if (stored) {
      this.strategies = JSON.parse(stored);
    }
  }

  private saveStrategies(): void {
    localStorage.setItem(
      'error_recovery_strategies',
      JSON.stringify(this.strategies)
    );
  }
}

// Instância singleton
let errorRecoveryServiceInstance: ErrorRecoveryService | null = null;

export const getErrorRecoveryService = (): ErrorRecoveryService => {
  if (!errorRecoveryServiceInstance) {
    errorRecoveryServiceInstance = new ErrorRecoveryService();
  }
  return errorRecoveryServiceInstance;
};

export default ErrorRecoveryService;
