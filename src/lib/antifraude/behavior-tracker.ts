/**
 * Rastreador de Comportamento do Usuário
 * Detecta padrões suspeitos e bots
 */

export interface EventoUsuario {
  tipo: 'keydown' | 'keyup' | 'click' | 'mousemove' | 'scroll' | 'focus' | 'blur' | 'paste' | 'copy';
  timestamp: number;
  dados?: any;
}

export interface DadosComportamentais {
  velocidadeDigitacaoMed: number;
  velocidadeDigitacaoDesvio: number;
  velocidadeMouseMed: number;
  padraoCliques: {
    total: number;
    intervaloMedio: number;
    desvioIntervalo: number;
  };
  tempoEntreAcoes: number[];
  sequenciaEventos: string[];
  eventosTotais: number;
  tempoSessaoSegundos: number;
  paginasVisitadas: number;
  acionamentosTeclas: Record<string, number>;
  movimentosMouse: number;
  scrollsRealizados: number;
  regularidadeExcessiva: boolean;
  acoesMuitoRapidas: boolean;
  padraoHumano: boolean;
  scoreBotProbabilidade: number;
  scoreNormalidade: number;
}

export class BehaviorTracker {
  private eventos: EventoUsuario[] = [];
  private inicioSessao: number;
  private paginasVisitadas: Set<string> = new Set();
  private intervalosTeclas: number[] = [];
  private ultimaTecla: number = 0;
  private cliques: number[] = [];
  private movimentosMouse: number = 0;
  private scrolls: number = 0;
  private acionamentosTeclas: Record<string, number> = {};
  
  constructor() {
    this.inicioSessao = Date.now();
    this.iniciarMonitoramento();
  }
  
  /**
   * Inicia monitoramento de eventos
   */
  private iniciarMonitoramento(): void {
    if (typeof window === 'undefined') return;
    
    // Monitorar digitação
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Monitorar mouse
    document.addEventListener('click', this.handleClick.bind(this));
    document.addEventListener('mousemove', this.handleMouseMove.bind(this), { passive: true });
    
    // Monitorar scroll
    document.addEventListener('scroll', this.handleScroll.bind(this), { passive: true });
    
    // Monitorar foco
    window.addEventListener('focus', this.handleFocus.bind(this));
    window.addEventListener('blur', this.handleBlur.bind(this));
    
    // Monitorar ações de copy/paste
    document.addEventListener('paste', this.handlePaste.bind(this));
    document.addEventListener('copy', this.handleCopy.bind(this));
  }
  
  /**
   * Para monitoramento
   */
  public pararMonitoramento(): void {
    if (typeof window === 'undefined') return;
    
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
    document.removeEventListener('keyup', this.handleKeyUp.bind(this));
    document.removeEventListener('click', this.handleClick.bind(this));
    document.removeEventListener('mousemove', this.handleMouseMove.bind(this));
    document.removeEventListener('scroll', this.handleScroll.bind(this));
    window.removeEventListener('focus', this.handleFocus.bind(this));
    window.removeEventListener('blur', this.handleBlur.bind(this));
    document.removeEventListener('paste', this.handlePaste.bind(this));
    document.removeEventListener('copy', this.handleCopy.bind(this));
  }
  
  private handleKeyDown(e: KeyboardEvent): void {
    const agora = Date.now();
    
    if (this.ultimaTecla > 0) {
      this.intervalosTeclas.push(agora - this.ultimaTecla);
    }
    
    this.ultimaTecla = agora;
    
    // Contar teclas
    const key = e.key || 'unknown';
    this.acionamentosTeclas[key] = (this.acionamentosTeclas[key] || 0) + 1;
    
    this.registrarEvento('keydown', { key });
  }
  
  private handleKeyUp(e: KeyboardEvent): void {
    this.registrarEvento('keyup', { key: e.key });
  }
  
  private handleClick(e: MouseEvent): void {
    this.cliques.push(Date.now());
    this.registrarEvento('click', {
      x: e.clientX,
      y: e.clientY,
      button: e.button
    });
  }
  
  private handleMouseMove(e: MouseEvent): void {
    this.movimentosMouse++;
    
    // Registrar apenas 1 a cada 100 movimentos para não sobrecarregar
    if (this.movimentosMouse % 100 === 0) {
      this.registrarEvento('mousemove', {
        x: e.clientX,
        y: e.clientY
      });
    }
  }
  
  private handleScroll(): void {
    this.scrolls++;
    
    // Registrar apenas 1 a cada 10 scrolls
    if (this.scrolls % 10 === 0) {
      this.registrarEvento('scroll', {
        scrollY: window.scrollY
      });
    }
  }
  
  private handleFocus(): void {
    this.registrarEvento('focus');
  }
  
  private handleBlur(): void {
    this.registrarEvento('blur');
  }
  
  private handlePaste(e: ClipboardEvent): void {
    this.registrarEvento('paste');
  }
  
  private handleCopy(e: ClipboardEvent): void {
    this.registrarEvento('copy');
  }
  
  /**
   * Registra um evento
   */
  private registrarEvento(tipo: EventoUsuario['tipo'], dados?: any): void {
    this.eventos.push({
      tipo,
      timestamp: Date.now(),
      dados
    });
    
    // Limitar histórico (últimos 1000 eventos)
    if (this.eventos.length > 1000) {
      this.eventos = this.eventos.slice(-1000);
    }
  }
  
  /**
   * Registra visita a página
   */
  public registrarPaginaVisitada(url: string): void {
    this.paginasVisitadas.add(url);
  }
  
  /**
   * Calcula velocidade média de digitação
   */
  private calcularVelocidadeDigitacao(): { media: number; desvio: number } {
    if (this.intervalosTeclas.length === 0) {
      return { media: 0, desvio: 0 };
    }
    
    const soma = this.intervalosTeclas.reduce((acc, val) => acc + val, 0);
    const media = soma / this.intervalosTeclas.length;
    
    const variancia = this.intervalosTeclas.reduce(
      (acc, val) => acc + Math.pow(val - media, 2),
      0
    ) / this.intervalosTeclas.length;
    
    const desvio = Math.sqrt(variancia);
    
    return { media, desvio };
  }
  
  /**
   * Calcula padrão de cliques
   */
  private calcularPadraoCliques(): {
    total: number;
    intervaloMedio: number;
    desvioIntervalo: number;
  } {
    const total = this.cliques.length;
    
    if (total < 2) {
      return { total, intervaloMedio: 0, desvioIntervalo: 0 };
    }
    
    const intervalos: number[] = [];
    for (let i = 1; i < this.cliques.length; i++) {
      intervalos.push(this.cliques[i] - this.cliques[i - 1]);
    }
    
    const soma = intervalos.reduce((acc, val) => acc + val, 0);
    const intervaloMedio = soma / intervalos.length;
    
    const variancia = intervalos.reduce(
      (acc, val) => acc + Math.pow(val - intervaloMedio, 2),
      0
    ) / intervalos.length;
    
    const desvioIntervalo = Math.sqrt(variancia);
    
    return { total, intervaloMedio, desvioIntervalo };
  }
  
  /**
   * Detecta regularidade excessiva (característica de bot)
   */
  private detectarRegularidadeExcessiva(): boolean {
    if (this.intervalosTeclas.length < 10) return false;
    
    const { desvio } = this.calcularVelocidadeDigitacao();
    
    // Desvio muito baixo = ações muito regulares = bot
    return desvio < 10;
  }
  
  /**
   * Detecta ações muito rápidas (bot)
   */
  private detectarAcoesMuitoRapidas(): boolean {
    if (this.intervalosTeclas.length < 5) return false;
    
    const { media } = this.calcularVelocidadeDigitacao();
    
    // Digitação muito rápida (< 20ms entre teclas)
    return media < 20;
  }
  
  /**
   * Calcula score de probabilidade de bot
   */
  private calcularScoreBot(): number {
    let score = 0;
    
    // 1. Regularidade excessiva
    if (this.detectarRegularidadeExcessiva()) {
      score += 0.3;
    }
    
    // 2. Ações muito rápidas
    if (this.detectarAcoesMuitoRapidas()) {
      score += 0.3;
    }
    
    // 3. Sem movimento de mouse
    if (this.eventos.length > 50 && this.movimentosMouse === 0) {
      score += 0.2;
    }
    
    // 4. Padrão perfeito de cliques
    const { desvioIntervalo, total } = this.calcularPadraoCliques();
    if (total > 5 && desvioIntervalo < 50) {
      score += 0.2;
    }
    
    return Math.min(score, 1);
  }
  
  /**
   * Calcula score de normalidade (padrão humano)
   */
  private calcularScoreNormalidade(): number {
    let score = 1;
    
    // Quanto mais variação, mais humano
    const { desvio } = this.calcularVelocidadeDigitacao();
    
    if (desvio === 0) {
      score -= 0.5;
    } else if (desvio < 20) {
      score -= 0.3;
    }
    
    // Presença de movimento de mouse é humano
    if (this.movimentosMouse > 0) {
      score += 0.2;
    }
    
    // Scrolls são humanos
    if (this.scrolls > 0) {
      score += 0.1;
    }
    
    return Math.max(0, Math.min(score, 1));
  }
  
  /**
   * Gera relatório completo de comportamento
   */
  public gerarRelatorio(): DadosComportamentais {
    const { media: velocidadeDigitacaoMed, desvio: velocidadeDigitacaoDesvio } = 
      this.calcularVelocidadeDigitacao();
    
    const padraoCliques = this.calcularPadraoCliques();
    
    const tempoEntreAcoes = this.eventos
      .slice(0, 100)
      .map((e, i) => i > 0 ? e.timestamp - this.eventos[i - 1].timestamp : 0)
      .filter(t => t > 0);
    
    const sequenciaEventos = this.eventos
      .slice(-50)
      .map(e => e.tipo);
    
    const tempoSessaoSegundos = Math.floor((Date.now() - this.inicioSessao) / 1000);
    
    const regularidadeExcessiva = this.detectarRegularidadeExcessiva();
    const acoesMuitoRapidas = this.detectarAcoesMuitoRapidas();
    const scoreBotProbabilidade = this.calcularScoreBot();
    const scoreNormalidade = this.calcularScoreNormalidade();
    const padraoHumano = scoreNormalidade > 0.6 && scoreBotProbabilidade < 0.4;
    
    return {
      velocidadeDigitacaoMed,
      velocidadeDigitacaoDesvio,
      velocidadeMouseMed: this.movimentosMouse / Math.max(tempoSessaoSegundos, 1),
      padraoCliques,
      tempoEntreAcoes,
      sequenciaEventos,
      eventosTotais: this.eventos.length,
      tempoSessaoSegundos,
      paginasVisitadas: this.paginasVisitadas.size,
      acionamentosTeclas: this.acionamentosTeclas,
      movimentosMouse: this.movimentosMouse,
      scrollsRealizados: this.scrolls,
      regularidadeExcessiva,
      acoesMuitoRapidas,
      padraoHumano,
      scoreBotProbabilidade,
      scoreNormalidade
    };
  }
  
  /**
   * Limpa dados coletados
   */
  public limpar(): void {
    this.eventos = [];
    this.intervalosTeclas = [];
    this.cliques = [];
    this.movimentosMouse = 0;
    this.scrolls = 0;
    this.acionamentosTeclas = {};
    this.paginasVisitadas.clear();
    this.inicioSessao = Date.now();
  }
}

// Singleton global
let trackerGlobal: BehaviorTracker | null = null;

/**
 * Obtém instância global do tracker
 */
export function obterTracker(): BehaviorTracker {
  if (!trackerGlobal) {
    trackerGlobal = new BehaviorTracker();
  }
  return trackerGlobal;
}

/**
 * Limpa tracker global
 */
export function limparTracker(): void {
  if (trackerGlobal) {
    trackerGlobal.pararMonitoramento();
    trackerGlobal = null;
  }
}

