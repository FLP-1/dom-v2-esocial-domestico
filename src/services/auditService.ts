// Serviço de Auditoria para rastreamento completo de ações no sistema eSocial
// Garante compliance e rastreabilidade de todas as operações

export interface AuditLog {
  id: string;
  timestamp: string;
  usuario: string;
  acao: string;
  recurso: string;
  detalhes: any;
  ip?: string;
  userAgent?: string;
  resultado: 'sucesso' | 'erro' | 'aviso';
  duracao?: number; // em milissegundos
  sessaoId?: string;
}

export interface AuditFilter {
  usuario?: string;
  acao?: string;
  recurso?: string;
  resultado?: string;
  dataInicio?: string;
  dataFim?: string;
  limite?: number;
}

export interface AuditStats {
  total: number;
  sucessos: number;
  erros: number;
  avisos: number;
  usuariosUnicos: number;
  acoesUnicas: number;
  periodo: {
    inicio: string;
    fim: string;
  };
}

class AuditService {
  private logs: AuditLog[] = [];
  private maxLogs = 10000; // Máximo de logs em memória
  private isEnabled = true;

  constructor() {
    this.loadLogs();
    this.startCleanupTimer();
  }

  // Registrar ação
  async logAction(
    usuario: string,
    acao: string,
    recurso: string,
    detalhes: any = {},
    resultado: 'sucesso' | 'erro' | 'aviso' = 'sucesso',
    duracao?: number
  ): Promise<void> {
    if (!this.isEnabled) return;

    const log: AuditLog = {
      id: this.generateId(),
      timestamp: new Date().toISOString(),
      usuario,
      acao,
      recurso,
      detalhes: this.sanitizeDetails(detalhes),
      ip: this.getClientIP(),
      userAgent: this.getUserAgent(),
      resultado,
      ...(duracao && { duracao }),
      sessaoId: this.getSessionId(),
    };

    this.logs.unshift(log); // Adicionar no início

    // Manter apenas os logs mais recentes
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.saveLogs();

    // Log crítico - sempre salvar
    if (this.isCriticalAction(acao)) {
      await this.saveCriticalLog(log);
    }
  }

  // Buscar logs com filtros
  searchLogs(filter: AuditFilter = {}): AuditLog[] {
    let filteredLogs = [...this.logs];

    if (filter.usuario) {
      filteredLogs = filteredLogs.filter(log =>
        log.usuario.toLowerCase().includes(filter.usuario!.toLowerCase())
      );
    }

    if (filter.acao) {
      filteredLogs = filteredLogs.filter(log =>
        log.acao.toLowerCase().includes(filter.acao!.toLowerCase())
      );
    }

    if (filter.recurso) {
      filteredLogs = filteredLogs.filter(log =>
        log.recurso.toLowerCase().includes(filter.recurso!.toLowerCase())
      );
    }

    if (filter.resultado) {
      filteredLogs = filteredLogs.filter(
        log => log.resultado === filter.resultado
      );
    }

    if (filter.dataInicio) {
      filteredLogs = filteredLogs.filter(
        log => log.timestamp >= filter.dataInicio!
      );
    }

    if (filter.dataFim) {
      filteredLogs = filteredLogs.filter(
        log => log.timestamp <= filter.dataFim!
      );
    }

    // Ordenar por timestamp (mais recente primeiro)
    filteredLogs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Aplicar limite
    if (filter.limite) {
      filteredLogs = filteredLogs.slice(0, filter.limite);
    }

    return filteredLogs;
  }

  // Obter estatísticas
  getStats(periodoDias: number = 30): AuditStats {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - periodoDias);

    const logsNoPeriodo = this.logs.filter(
      log => new Date(log.timestamp) >= cutoffDate
    );

    const sucessos = logsNoPeriodo.filter(
      log => log.resultado === 'sucesso'
    ).length;
    const erros = logsNoPeriodo.filter(log => log.resultado === 'erro').length;
    const avisos = logsNoPeriodo.filter(
      log => log.resultado === 'aviso'
    ).length;

    const usuariosUnicos = new Set(logsNoPeriodo.map(log => log.usuario)).size;
    const acoesUnicas = new Set(logsNoPeriodo.map(log => log.acao)).size;

    return {
      total: logsNoPeriodo.length,
      sucessos,
      erros,
      avisos,
      usuariosUnicos,
      acoesUnicas,
      periodo: {
        inicio: cutoffDate.toISOString(),
        fim: new Date().toISOString(),
      },
    };
  }

  // Exportar logs
  exportLogs(
    filter: AuditFilter = {},
    formato: 'json' | 'csv' = 'json'
  ): string {
    const logs = this.searchLogs(filter);

    if (formato === 'csv') {
      return this.exportToCSV(logs);
    } else {
      return JSON.stringify(logs, null, 2);
    }
  }

  // Limpar logs antigos
  async cleanupOldLogs(diasRetencao: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - diasRetencao);

    const logsAntigos = this.logs.filter(
      log => new Date(log.timestamp) < cutoffDate
    );

    this.logs = this.logs.filter(log => new Date(log.timestamp) >= cutoffDate);

    this.saveLogs();
    return logsAntigos.length;
  }

  // Habilitar/desabilitar auditoria
  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    localStorage.setItem('audit_enabled', enabled.toString());
  }

  isAuditEnabled(): boolean {
    return this.isEnabled;
  }

  // Métodos específicos para ações do eSocial
  async logESocialEvent(
    usuario: string,
    evento: string,
    protocolo: string,
    resultado: 'sucesso' | 'erro',
    detalhes: any = {}
  ): Promise<void> {
    await this.logAction(
      usuario,
      `eSocial: ${evento}`,
      'eSocial',
      {
        protocolo,
        evento,
        ...detalhes,
      },
      resultado
    );
  }

  async logCertificateAction(
    usuario: string,
    acao: 'upload' | 'delete' | 'validate',
    resultado: 'sucesso' | 'erro',
    detalhes: any = {}
  ): Promise<void> {
    await this.logAction(
      usuario,
      `Certificado: ${acao}`,
      'Certificado Digital',
      detalhes,
      resultado
    );
  }

  async logProxyAction(
    usuario: string,
    acao: 'upload' | 'delete' | 'validate',
    resultado: 'sucesso' | 'erro',
    detalhes: any = {}
  ): Promise<void> {
    await this.logAction(
      usuario,
      `Procuração: ${acao}`,
      'Procuração Eletrônica',
      detalhes,
      resultado
    );
  }

  async logBackupAction(
    usuario: string,
    acao: 'create' | 'restore' | 'delete',
    tipo: string,
    resultado: 'sucesso' | 'erro',
    detalhes: any = {}
  ): Promise<void> {
    await this.logAction(
      usuario,
      `Backup: ${acao}`,
      'Sistema de Backup',
      {
        tipo,
        ...detalhes,
      },
      resultado
    );
  }

  async logWebhookAction(
    usuario: string,
    acao: 'configure' | 'test' | 'delete',
    url: string,
    resultado: 'sucesso' | 'erro',
    detalhes: any = {}
  ): Promise<void> {
    await this.logAction(
      usuario,
      `Webhook: ${acao}`,
      'Sistema de Webhooks',
      {
        url: this.maskUrl(url),
        ...detalhes,
      },
      resultado
    );
  }

  // Métodos privados
  private generateId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sanitizeDetails(detalhes: any): any {
    // Remover informações sensíveis
    const sanitized = { ...detalhes };

    // Mascarar senhas e tokens
    if (sanitized.senha) sanitized.senha = '***';
    if (sanitized.password) sanitized.password = '***';
    if (sanitized.token) sanitized.token = '***';
    if (sanitized.secret) sanitized.secret = '***';

    return sanitized;
  }

  private getClientIP(): string {
    // Em produção, obter IP real
    return '127.0.0.1';
  }

  private getUserAgent(): string {
    return navigator.userAgent;
  }

  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('session_id');
    if (!sessionId) {
      sessionId = this.generateId();
      sessionStorage.setItem('session_id', sessionId);
    }
    return sessionId;
  }

  private isCriticalAction(acao: string): boolean {
    const criticalActions = [
      'delete',
      'restore',
      'configure',
      'upload',
      'download',
      'eSocial:',
      'Certificado:',
      'Procuração:',
      'Backup:',
      'Webhook:',
    ];

    return criticalActions.some(critical =>
      acao.toLowerCase().includes(critical.toLowerCase())
    );
  }

  private async saveCriticalLog(log: AuditLog): Promise<void> {
    const stored = localStorage.getItem('critical_audit_logs');
    const criticalLogs = stored ? JSON.parse(stored) : [];

    criticalLogs.unshift(log);

    // Manter apenas os últimos 1000 logs críticos
    if (criticalLogs.length > 1000) {
      criticalLogs.splice(1000);
    }

    localStorage.setItem('critical_audit_logs', JSON.stringify(criticalLogs));
  }

  private exportToCSV(logs: AuditLog[]): string {
    const headers = [
      'ID',
      'Timestamp',
      'Usuário',
      'Ação',
      'Recurso',
      'Resultado',
      'IP',
      'Duração (ms)',
      'Detalhes',
    ];

    const rows = logs.map(log => [
      log.id,
      log.timestamp,
      log.usuario,
      log.acao,
      log.recurso,
      log.resultado,
      log.ip || '',
      log.duracao || '',
      JSON.stringify(log.detalhes),
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    return csvContent;
  }

  private maskUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return 'URL inválida';
    }
  }

  private loadLogs(): void {
    const stored = localStorage.getItem('audit_logs');
    if (stored) {
      this.logs = JSON.parse(stored);
    }

    const enabled = localStorage.getItem('audit_enabled');
    this.isEnabled = enabled !== 'false';
  }

  private saveLogs(): void {
    localStorage.setItem('audit_logs', JSON.stringify(this.logs));
  }

  private startCleanupTimer(): void {
    // Limpar logs antigos diariamente
    setInterval(
      () => {
        this.cleanupOldLogs(90);
      },
      24 * 60 * 60 * 1000
    ); // 24 horas
  }
}

// Instância singleton
let auditServiceInstance: AuditService | null = null;

export const getAuditService = (): AuditService => {
  if (!auditServiceInstance) {
    auditServiceInstance = new AuditService();
  }
  return auditServiceInstance;
};

export default AuditService;
