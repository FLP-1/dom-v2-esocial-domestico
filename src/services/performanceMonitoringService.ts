// Serviço de Monitoramento de Performance para o Sistema DOM
// Coleta métricas de performance e gera alertas

export interface PerformanceMetric {
  id: string;
  timestamp: string;
  tipo: 'api' | 'ui' | 'database' | 'memory' | 'cpu' | 'network';
  nome: string;
  valor: number;
  unidade: string;
  contexto?: {
    endpoint?: string;
    metodo?: string;
    usuario?: string;
    sessao?: string;
    elemento?: string;
    classe?: string;
    mensagem?: string;
    arquivo?: string;
    linha?: string;
    motivo?: string;
  };
  tags?: Record<string, string>;
}

export interface PerformanceAlert {
  id: string;
  timestamp: string;
  tipo: 'threshold' | 'anomaly' | 'error' | 'warning';
  severidade: 'baixa' | 'media' | 'alta' | 'critica';
  titulo: string;
  descricao: string;
  metricas: string[];
  resolvido: boolean;
  resolvidoEm?: string;
  acao?: string;
}

export interface PerformanceReport {
  periodo: {
    inicio: string;
    fim: string;
  };
  resumo: {
    totalMetricas: number;
    totalAlertas: number;
    alertasCriticos: number;
    performanceMedia: number;
  };
  topMetricas: PerformanceMetric[];
  alertas: PerformanceAlert[];
  tendencias: {
    nome: string;
    tendencia: 'melhorando' | 'piorando' | 'estavel';
    variacao: number;
  }[];
}

class PerformanceMonitoringService {
  private metrics: PerformanceMetric[] = [];
  private alerts: PerformanceAlert[] = [];
  private thresholds: Record<string, { min: number; max: number }> = {};
  private isMonitoring = false;
  private monitoringInterval?: NodeJS.Timeout;
  private observers: ((metrics: PerformanceMetric[]) => void)[] = [];

  constructor() {
    this.loadData();
    this.initializeThresholds();
    this.startMonitoring();
  }

  // Iniciar monitoramento
  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;

    // Monitorar métricas do navegador
    this.monitoringInterval = setInterval(() => {
      this.collectBrowserMetrics();
    }, 60000); // A cada minuto

    // Monitorar performance de API
    this.setupAPIMonitoring();

    // Monitorar performance de UI
    this.setupUIMonitoring();
  }

  // Parar monitoramento
  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
  }

  // Coletar métricas do navegador
  private collectBrowserMetrics(): void {
    if (typeof window === 'undefined') return;

    // Memória
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      this.recordMetric({
        tipo: 'memory',
        nome: 'used_js_heap_size',
        valor: memory.usedJSHeapSize,
        unidade: 'bytes',
      });

      this.recordMetric({
        tipo: 'memory',
        nome: 'total_js_heap_size',
        valor: memory.totalJSHeapSize,
        unidade: 'bytes',
      });

      this.recordMetric({
        tipo: 'memory',
        nome: 'js_heap_size_limit',
        valor: memory.jsHeapSizeLimit,
        unidade: 'bytes',
      });
    }

    // Timing
    const timing = performance.timing;
    const navigationStart = timing.navigationStart;
    const now = Date.now();

    this.recordMetric({
      tipo: 'ui',
      nome: 'page_load_time',
      valor: now - navigationStart,
      unidade: 'ms',
    });

    this.recordMetric({
      tipo: 'ui',
      nome: 'dom_content_loaded',
      valor: timing.domContentLoadedEventEnd - navigationStart,
      unidade: 'ms',
    });

    this.recordMetric({
      tipo: 'ui',
      nome: 'window_load',
      valor: timing.loadEventEnd - navigationStart,
      unidade: 'ms',
    });

    // Network
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.recordMetric({
        tipo: 'network',
        nome: 'connection_speed',
        valor: connection.downlink || 0,
        unidade: 'mbps',
      });

      this.recordMetric({
        tipo: 'network',
        nome: 'connection_rtt',
        valor: connection.rtt || 0,
        unidade: 'ms',
      });
    }
  }

  // Configurar monitoramento de API
  private setupAPIMonitoring(): void {
    // Interceptar fetch requests
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = performance.now();
      const url = args[0] as string;
      const method = args[1]?.method || 'GET';

      try {
        const response = await originalFetch(...args);
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric({
          tipo: 'api',
          nome: 'request_duration',
          valor: duration,
          unidade: 'ms',
          contexto: {
            endpoint: url,
            metodo: method,
          },
        });

        this.recordMetric({
          tipo: 'api',
          nome: 'response_status',
          valor: response.status,
          unidade: 'status_code',
          contexto: {
            endpoint: url,
            metodo: method,
          },
        });

        return response;
      } catch (error) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        this.recordMetric({
          tipo: 'api',
          nome: 'request_error',
          valor: 1,
          unidade: 'count',
          contexto: {
            endpoint: url,
            metodo: method,
          },
        });

        this.recordMetric({
          tipo: 'api',
          nome: 'request_error_duration',
          valor: duration,
          unidade: 'ms',
          contexto: {
            endpoint: url,
            metodo: method,
          },
        });

        throw error;
      }
    };
  }

  // Configurar monitoramento de UI
  private setupUIMonitoring(): void {
    // Monitorar cliques
    document.addEventListener('click', event => {
      const target = event.target as HTMLElement;
      this.recordMetric({
        tipo: 'ui',
        nome: 'click_count',
        valor: 1,
        unidade: 'count',
        contexto: {
          elemento: target.tagName,
          classe: target.className,
        },
      });
    });

    // Monitorar erros JavaScript
    window.addEventListener('error', event => {
      this.recordMetric({
        tipo: 'ui',
        nome: 'javascript_error',
        valor: 1,
        unidade: 'count',
        contexto: {
          mensagem: event.message,
          arquivo: event.filename,
          linha: event.lineno?.toString(),
        },
      });
    });

    // Monitorar Promise rejections
    window.addEventListener('unhandledrejection', event => {
      this.recordMetric({
        tipo: 'ui',
        nome: 'promise_rejection',
        valor: 1,
        unidade: 'count',
        contexto: {
          motivo: event.reason?.toString(),
        },
      });
    });
  }

  // Registrar métrica
  recordMetric(metric: Omit<PerformanceMetric, 'id' | 'timestamp'>): void {
    const newMetric: PerformanceMetric = {
      ...metric,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    this.metrics.unshift(newMetric);

    // Manter apenas as últimas 10000 métricas
    if (this.metrics.length > 10000) {
      this.metrics = this.metrics.slice(0, 10000);
    }

    this.saveData();
    this.checkThresholds(newMetric);
    this.notifyObservers();
  }

  // Verificar thresholds
  private checkThresholds(metric: PerformanceMetric): void {
    const threshold = this.thresholds[metric.nome];
    if (!threshold) return;

    const alertType: PerformanceAlert['tipo'] = 'threshold';
    let severidade: PerformanceAlert['severidade'] = 'baixa';
    let titulo = '';
    let descricao = '';

    if (metric.valor > threshold.max) {
      severidade = metric.valor > threshold.max * 1.5 ? 'critica' : 'alta';
      titulo = `Métrica ${metric.nome} acima do limite`;
      descricao = `Valor: ${metric.valor}${metric.unidade}, Limite: ${threshold.max}${metric.unidade}`;
    } else if (metric.valor < threshold.min) {
      severidade = 'media';
      titulo = `Métrica ${metric.nome} abaixo do limite`;
      descricao = `Valor: ${metric.valor}${metric.unidade}, Limite mínimo: ${threshold.min}${metric.unidade}`;
    } else {
      return; // Dentro dos limites
    }

    this.createAlert({
      tipo: alertType,
      severidade,
      titulo,
      descricao,
      metricas: [metric.nome],
    });
  }

  // Criar alerta
  createAlert(
    alert: Omit<PerformanceAlert, 'id' | 'timestamp' | 'resolvido'>
  ): void {
    const newAlert: PerformanceAlert = {
      ...alert,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      resolvido: false,
    };

    this.alerts.unshift(newAlert);

    // Manter apenas os últimos 1000 alertas
    if (this.alerts.length > 1000) {
      this.alerts = this.alerts.slice(0, 1000);
    }

    this.saveData();
  }

  // Obter métricas
  getMetrics(filtros?: {
    tipo?: string;
    nome?: string;
    dataInicio?: string;
    dataFim?: string;
    limite?: number;
  }): PerformanceMetric[] {
    let filtered = [...this.metrics];

    if (filtros?.tipo) {
      filtered = filtered.filter(m => m.tipo === filtros.tipo);
    }

    if (filtros?.nome) {
      filtered = filtered.filter(m => m.nome.includes(filtros.nome!));
    }

    if (filtros?.dataInicio) {
      filtered = filtered.filter(m => m.timestamp >= filtros.dataInicio!);
    }

    if (filtros?.dataFim) {
      filtered = filtered.filter(m => m.timestamp <= filtros.dataFim!);
    }

    if (filtros?.limite) {
      filtered = filtered.slice(0, filtros.limite);
    }

    return filtered;
  }

  // Obter alertas
  getAlerts(filtros?: {
    tipo?: string;
    severidade?: string;
    resolvido?: boolean;
    limite?: number;
  }): PerformanceAlert[] {
    let filtered = [...this.alerts];

    if (filtros?.tipo) {
      filtered = filtered.filter(a => a.tipo === filtros.tipo);
    }

    if (filtros?.severidade) {
      filtered = filtered.filter(a => a.severidade === filtros.severidade);
    }

    if (filtros?.resolvido !== undefined) {
      filtered = filtered.filter(a => a.resolvido === filtros.resolvido);
    }

    if (filtros?.limite) {
      filtered = filtered.slice(0, filtros.limite);
    }

    return filtered;
  }

  // Gerar relatório de performance
  generateReport(periodoDias: number = 7): PerformanceReport {
    const fim = new Date();
    const inicio = new Date(fim.getTime() - periodoDias * 24 * 60 * 60 * 1000);

    const metricasNoPeriodo = this.metrics.filter(
      m => new Date(m.timestamp) >= inicio && new Date(m.timestamp) <= fim
    );

    const alertasNoPeriodo = this.alerts.filter(
      a => new Date(a.timestamp) >= inicio && new Date(a.timestamp) <= fim
    );

    const alertasCriticos = alertasNoPeriodo.filter(
      a => a.severidade === 'critica'
    ).length;

    // Calcular performance média
    const metricasTempo = metricasNoPeriodo.filter(
      m => m.nome.includes('duration') || m.nome.includes('time')
    );
    const performanceMedia =
      metricasTempo.length > 0
        ? metricasTempo.reduce((sum, m) => sum + m.valor, 0) /
          metricasTempo.length
        : 0;

    // Top métricas por frequência
    const metricasCount = metricasNoPeriodo.reduce(
      (acc, m) => {
        acc[m.nome] = (acc[m.nome] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    const topMetricas = Object.entries(metricasCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([nome]) => metricasNoPeriodo.find(m => m.nome === nome))
      .filter(Boolean) as PerformanceMetric[];

    // Calcular tendências
    const tendencias = this.calculateTrends(metricasNoPeriodo);

    return {
      periodo: {
        inicio: inicio.toISOString(),
        fim: fim.toISOString(),
      },
      resumo: {
        totalMetricas: metricasNoPeriodo.length,
        totalAlertas: alertasNoPeriodo.length,
        alertasCriticos,
        performanceMedia,
      },
      topMetricas,
      alertas: alertasNoPeriodo.slice(0, 20),
      tendencias,
    };
  }

  // Calcular tendências
  private calculateTrends(
    metricas: PerformanceMetric[]
  ): PerformanceReport['tendencias'] {
    const metricasPorNome = metricas.reduce(
      (acc, m) => {
        if (!acc[m.nome]) acc[m.nome] = [];
        acc[m.nome]!.push(m);
        return acc;
      },
      {} as Record<string, PerformanceMetric[]>
    );

    return Object.entries(metricasPorNome).map(([nome, ms]) => {
      if (!ms || ms.length < 2) {
        return { nome, tendencia: 'estavel' as const, variacao: 0 };
      }

      const primeiro = ms[ms.length - 1]!.valor;
      const ultimo = ms[0]!.valor;
      const variacao = ((ultimo - primeiro) / primeiro) * 100;

      let tendencia: 'melhorando' | 'piorando' | 'estavel';
      if (variacao > 10) tendencia = 'piorando';
      else if (variacao < -10) tendencia = 'melhorando';
      else tendencia = 'estavel';

      return { nome, tendencia, variacao };
    });
  }

  // Configurar thresholds
  setThreshold(nome: string, min: number, max: number): void {
    this.thresholds[nome] = { min, max };
    this.saveData();
  }

  // Inicializar thresholds padrão
  private initializeThresholds(): void {
    this.thresholds = {
      request_duration: { min: 0, max: 5000 },
      page_load_time: { min: 0, max: 3000 },
      memory_usage: { min: 0, max: 100 * 1024 * 1024 }, // 100MB
      javascript_error: { min: 0, max: 0 },
      promise_rejection: { min: 0, max: 0 },
    };
  }

  // Adicionar observer
  addObserver(callback: (metrics: PerformanceMetric[]) => void): () => void {
    this.observers.push(callback);
    return () => {
      const index = this.observers.indexOf(callback);
      if (index > -1) {
        this.observers.splice(index, 1);
      }
    };
  }

  // Notificar observers
  private notifyObservers(): void {
    this.observers.forEach(callback => callback([...this.metrics]));
  }

  // Métodos utilitários
  private generateId(): string {
    return `perf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private loadData(): void {
    const storedMetrics = localStorage.getItem('performance_metrics');
    const storedAlerts = localStorage.getItem('performance_alerts');
    const storedThresholds = localStorage.getItem('performance_thresholds');

    if (storedMetrics) {
      this.metrics = JSON.parse(storedMetrics);
    }

    if (storedAlerts) {
      this.alerts = JSON.parse(storedAlerts);
    }

    if (storedThresholds) {
      this.thresholds = JSON.parse(storedThresholds);
    }
  }

  private saveData(): void {
    localStorage.setItem('performance_metrics', JSON.stringify(this.metrics));
    localStorage.setItem('performance_alerts', JSON.stringify(this.alerts));
    localStorage.setItem(
      'performance_thresholds',
      JSON.stringify(this.thresholds)
    );
  }
}

// Instância singleton
let performanceMonitoringServiceInstance: PerformanceMonitoringService | null =
  null;

export const getPerformanceMonitoringService =
  (): PerformanceMonitoringService => {
    if (!performanceMonitoringServiceInstance) {
      performanceMonitoringServiceInstance = new PerformanceMonitoringService();
    }
    return performanceMonitoringServiceInstance;
  };

export default PerformanceMonitoringService;
