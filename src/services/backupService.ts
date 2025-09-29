// Serviço de Backup Automático para dados do eSocial
// Garante a integridade e recuperação de dados críticos

export interface BackupConfig {
  frequencia: 'diario' | 'semanal' | 'mensal';
  horario: string; // HH:MM
  retencao: number; // dias
  compressao: boolean;
  criptografia: boolean;
  destino: 'local' | 'cloud' | 'ambos';
}

export interface BackupItem {
  id: string;
  tipo: 'eventos' | 'configuracoes' | 'certificados' | 'logs' | 'completo';
  data: string;
  tamanho: number;
  status: 'sucesso' | 'erro' | 'processando';
  arquivo?: string;
  erro?: string;
  checksum?: string;
}

export interface RestorePoint {
  id: string;
  data: string;
  descricao: string;
  itens: BackupItem[];
  tamanhoTotal: number;
  status: 'disponivel' | 'corrompido' | 'expirado';
}

class BackupService {
  private config: BackupConfig;
  private backups: BackupItem[] = [];
  private isRunning = false;
  private nextBackup?: Date;

  constructor() {
    this.config = this.loadConfig();
    this.loadBackups();
    this.scheduleNextBackup();
  }

  // Configurar backup
  async configureBackup(config: BackupConfig): Promise<boolean> {
    try {
      this.config = config;
      this.saveConfig();
      this.scheduleNextBackup();
      return true;
    } catch (error) {
      // console.error('Erro ao configurar backup:', error);
      return false;
    }
  }

  // Executar backup manual
  async executeBackup(
    tipo: 'eventos' | 'configuracoes' | 'certificados' | 'logs' | 'completo'
  ): Promise<BackupItem> {
    if (this.isRunning) {
      throw new Error('Backup já está em execução');
    }

    this.isRunning = true;
    const backupId = this.generateId();

    const backupItem: BackupItem = {
      id: backupId,
      tipo,
      data: new Date().toISOString(),
      tamanho: 0,
      status: 'processando',
    };

    try {
      // Adicionar à lista de backups
      this.backups.unshift(backupItem);
      this.saveBackups();

      // Executar backup baseado no tipo
      let data: any;
      let filename: string;

      switch (tipo) {
        case 'eventos':
          data = await this.backupEventos();
          filename = `eventos_${this.formatDate(new Date())}.json`;
          break;
        case 'configuracoes':
          data = await this.backupConfiguracoes();
          filename = `configuracoes_${this.formatDate(new Date())}.json`;
          break;
        case 'certificados':
          data = await this.backupCertificados();
          filename = `certificados_${this.formatDate(new Date())}.json`;
          break;
        case 'logs':
          data = await this.backupLogs();
          filename = `logs_${this.formatDate(new Date())}.json`;
          break;
        case 'completo':
          data = await this.backupCompleto();
          filename = `backup_completo_${this.formatDate(new Date())}.json`;
          break;
        default:
          throw new Error('Tipo de backup inválido');
      }

      // Processar dados
      const processedData = this.config.compressao
        ? await this.compressData(data)
        : data;

      const encryptedData = this.config.criptografia
        ? await this.encryptData(processedData)
        : processedData;

      // Calcular tamanho e checksum
      const dataString = JSON.stringify(encryptedData);
      backupItem.tamanho = new Blob([dataString]).size;
      backupItem.checksum = await this.calculateChecksum(dataString);
      backupItem.arquivo = filename;
      backupItem.status = 'sucesso';

      // Salvar arquivo
      await this.saveBackupFile(filename, encryptedData);

      // Atualizar backup
      this.updateBackup(backupItem);
      this.saveBackups();

      return backupItem;
    } catch (error) {
      backupItem.status = 'erro';
      backupItem.erro =
        error instanceof Error ? error.message : 'Erro desconhecido';
      this.updateBackup(backupItem);
      this.saveBackups();
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  // Restaurar backup
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const backup = this.backups.find(b => b.id === backupId);
      if (!backup) {
        throw new Error('Backup não encontrado');
      }

      if (backup.status !== 'sucesso') {
        throw new Error('Backup não pode ser restaurado');
      }

      // Carregar dados do backup
      const data = await this.loadBackupFile(backup.arquivo!);

      // Descriptografar se necessário
      const decryptedData = this.config.criptografia
        ? await this.decryptData(data)
        : data;

      // Descomprimir se necessário
      const decompressedData = this.config.compressao
        ? await this.decompressData(decryptedData)
        : decryptedData;

      // Restaurar dados baseado no tipo
      switch (backup.tipo) {
        case 'eventos':
          await this.restoreEventos(decompressedData);
          break;
        case 'configuracoes':
          await this.restoreConfiguracoes(decompressedData);
          break;
        case 'certificados':
          await this.restoreCertificados(decompressedData);
          break;
        case 'logs':
          await this.restoreLogs(decompressedData);
          break;
        case 'completo':
          await this.restoreCompleto(decompressedData);
          break;
      }

      return true;
    } catch (error) {
      // console.error('Erro ao restaurar backup:', error);
      return false;
    }
  }

  // Obter estatísticas de backup
  getBackupStats(): {
    total: number;
    sucesso: number;
    erro: number;
    tamanhoTotal: number;
    proximoBackup?: string;
  } {
    const sucesso = this.backups.filter(b => b.status === 'sucesso').length;
    const erro = this.backups.filter(b => b.status === 'erro').length;
    const tamanhoTotal = this.backups.reduce((sum, b) => sum + b.tamanho, 0);

    return {
      total: this.backups.length,
      sucesso,
      erro,
      tamanhoTotal,
      ...(this.nextBackup && { proximoBackup: this.nextBackup.toISOString() }),
    };
  }

  // Limpar backups antigos
  async cleanupOldBackups(): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retencao);

    const oldBackups = this.backups.filter(
      backup => new Date(backup.data) < cutoffDate
    );

    for (const backup of oldBackups) {
      if (backup.arquivo) {
        await this.deleteBackupFile(backup.arquivo);
      }
    }

    this.backups = this.backups.filter(
      backup => new Date(backup.data) >= cutoffDate
    );

    this.saveBackups();
    return oldBackups.length;
  }

  // Métodos privados para backup de dados específicos
  private async backupEventos(): Promise<any> {
    const eventos = localStorage.getItem('esocial_events');
    return eventos ? JSON.parse(eventos) : [];
  }

  private async backupConfiguracoes(): Promise<any> {
    return {
      esocial: localStorage.getItem('esocial_certificate'),
      proxy: localStorage.getItem('esocial_proxy'),
      webhook: localStorage.getItem('webhook_subscriptions'),
      backup: this.config,
    };
  }

  private async backupCertificados(): Promise<any> {
    return {
      certificate: localStorage.getItem('esocial_certificate'),
      proxy: localStorage.getItem('esocial_proxy'),
    };
  }

  private async backupLogs(): Promise<any> {
    return {
      webhook: localStorage.getItem('webhook_events'),
      audit: localStorage.getItem('audit_logs'),
    };
  }

  private async backupCompleto(): Promise<any> {
    return {
      eventos: await this.backupEventos(),
      configuracoes: await this.backupConfiguracoes(),
      certificados: await this.backupCertificados(),
      logs: await this.backupLogs(),
      metadata: {
        versao: '1.0.0',
        data: new Date().toISOString(),
        sistema: 'DOM eSocial',
      },
    };
  }

  // Métodos privados para restauração
  private async restoreEventos(data: any): Promise<void> {
    localStorage.setItem('esocial_events', JSON.stringify(data));
  }

  private async restoreConfiguracoes(data: any): Promise<void> {
    if (data.esocial) localStorage.setItem('esocial_certificate', data.esocial);
    if (data.proxy) localStorage.setItem('esocial_proxy', data.proxy);
    if (data.webhook)
      localStorage.setItem('webhook_subscriptions', data.webhook);
    if (data.backup) this.config = data.backup;
  }

  private async restoreCertificados(data: any): Promise<void> {
    if (data.certificate)
      localStorage.setItem('esocial_certificate', data.certificate);
    if (data.proxy) localStorage.setItem('esocial_proxy', data.proxy);
  }

  private async restoreLogs(data: any): Promise<void> {
    if (data.webhook) localStorage.setItem('webhook_events', data.webhook);
    if (data.audit) localStorage.setItem('audit_logs', data.audit);
  }

  private async restoreCompleto(data: any): Promise<void> {
    if (data.eventos) await this.restoreEventos(data.eventos);
    if (data.configuracoes) await this.restoreConfiguracoes(data.configuracoes);
    if (data.certificados) await this.restoreCertificados(data.certificados);
    if (data.logs) await this.restoreLogs(data.logs);
  }

  // Métodos utilitários
  private async compressData(data: any): Promise<any> {
    // Simular compressão (em produção usar biblioteca real)
    return { compressed: true, data: JSON.stringify(data) };
  }

  private async decompressData(data: any): Promise<any> {
    // Simular descompressão
    return data.compressed ? JSON.parse(data.data) : data;
  }

  private async encryptData(data: any): Promise<any> {
    // Simular criptografia (em produção usar biblioteca real)
    return { encrypted: true, data: btoa(JSON.stringify(data)) };
  }

  private async decryptData(data: any): Promise<any> {
    // Simular descriptografia
    return data.encrypted ? JSON.parse(atob(data.data)) : data;
  }

  private async calculateChecksum(data: string): Promise<string> {
    // Simular cálculo de checksum (em produção usar algoritmo real)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString(16);
  }

  private async saveBackupFile(filename: string, data: any): Promise<void> {
    // Simular salvamento de arquivo
    const backupData = {
      filename,
      data,
      timestamp: new Date().toISOString(),
    };

    const stored = localStorage.getItem('backup_files');
    const files = stored ? JSON.parse(stored) : {};
    files[filename] = backupData;
    localStorage.setItem('backup_files', JSON.stringify(files));
  }

  private async loadBackupFile(filename: string): Promise<any> {
    const stored = localStorage.getItem('backup_files');
    const files = stored ? JSON.parse(stored) : {};
    return files[filename]?.data;
  }

  private async deleteBackupFile(filename: string): Promise<void> {
    const stored = localStorage.getItem('backup_files');
    const files = stored ? JSON.parse(stored) : {};
    delete files[filename];
    localStorage.setItem('backup_files', JSON.stringify(files));
  }

  private scheduleNextBackup(): void {
    if (!this.config.frequencia) return;

    const now = new Date();
    const [hours, minutes] = this.config.horario.split(':').map(Number);
    if (hours === undefined || minutes === undefined) return;

    const nextBackup = new Date();
    nextBackup.setHours(hours, minutes, 0, 0);

    switch (this.config.frequencia) {
      case 'diario':
        if (nextBackup <= now) {
          nextBackup.setDate(nextBackup.getDate() + 1);
        }
        break;
      case 'semanal':
        nextBackup.setDate(nextBackup.getDate() + 7);
        break;
      case 'mensal':
        nextBackup.setMonth(nextBackup.getMonth() + 1);
        break;
    }

    this.nextBackup = nextBackup;

    // Agendar execução
    const delay = nextBackup.getTime() - now.getTime();
    setTimeout(() => {
      this.executeBackup('completo');
      this.scheduleNextBackup();
    }, delay);
  }

  private formatDate(date: Date): string {
    return date.toISOString().split('T')[0]!;
  }

  private generateId(): string {
    return `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private updateBackup(backup: BackupItem): void {
    const index = this.backups.findIndex(b => b.id === backup.id);
    if (index >= 0) {
      this.backups[index] = backup;
    }
  }

  private loadConfig(): BackupConfig {
    const stored = localStorage.getItem('backup_config');
    return stored
      ? JSON.parse(stored)
      : {
          frequencia: 'diario',
          horario: '02:00',
          retencao: 30,
          compressao: true,
          criptografia: true,
          destino: 'local',
        };
  }

  private saveConfig(): void {
    localStorage.setItem('backup_config', JSON.stringify(this.config));
  }

  private loadBackups(): void {
    const stored = localStorage.getItem('backup_items');
    if (stored) {
      this.backups = JSON.parse(stored);
    }
  }

  private saveBackups(): void {
    localStorage.setItem('backup_items', JSON.stringify(this.backups));
  }
}

// Instância singleton
let backupServiceInstance: BackupService | null = null;

export const getBackupService = (): BackupService => {
  if (!backupServiceInstance) {
    backupServiceInstance = new BackupService();
  }
  return backupServiceInstance;
};

export default BackupService;
