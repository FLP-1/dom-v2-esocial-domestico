/**
 * Biblioteca de Device Fingerprinting - Antifraude
 * 
 * Gera identificador único do dispositivo baseado em múltiplas técnicas:
 * - Canvas Fingerprinting
 * - Audio Fingerprinting
 * - WebGL Fingerprinting
 * - Hardware Detection
 * - Font Detection
 * - Browser Characteristics
 */

import { sha256 } from './crypto-utils';

export interface FingerprintData {
  canvasFingerprint: string;
  webglFingerprint: string;
  audioFingerprint: string;
  platform: string;
  cpuCores: number;
  memoria: number | null;
  telaResolucao: string;
  telaColorDepth: number;
  timezone: string;
  idioma: string;
  fontesDetectadas: string[];
  userAgent: string;
  plugins: string[];
  navegador: string;
  navegadorVersao: string;
  sistemaOperacional: string;
  dispositivoTipo: string;
  touchSupport: boolean;
  webglVendor: string;
  webglRenderer: string;
  fingerprintHash: string;
}

/**
 * Gera Canvas Fingerprint
 * Cada dispositivo renderiza canvas de forma ligeiramente diferente
 */
async function gerarCanvasFingerprint(): Promise<string> {
  try {
    // ✅ Proteção SSR - APIs do navegador só no cliente
    if (typeof window === 'undefined') {
      return 'canvas-ssr-not-supported';
    }
    
    const canvas = document.createElement('canvas');
    canvas.width = 280;
    canvas.height = 60;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return 'canvas-not-supported';
    
    // Configurações que maximizam diferenças entre dispositivos
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    
    ctx.fillStyle = '#069';
    ctx.font = '11pt "Times New Roman"';
    
    // Texto com emojis e caracteres especiais
    const texto = 'DOM 🔐 Antifraude Ωαβγδε';
    ctx.fillText(texto, 2, 15);
    
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.font = '18pt Arial';
    ctx.fillText(texto, 4, 45);
    
    // Adicionar formas geométricas
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(255,0,255)';
    ctx.beginPath();
    ctx.arc(50, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = 'rgb(0,255,255)';
    ctx.beginPath();
    ctx.arc(100, 50, 50, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fill();
    
    return canvas.toDataURL();
  } catch (error) {
    console.error('Erro ao gerar canvas fingerprint:', error);
    return 'canvas-error';
  }
}

/**
 * Gera WebGL Fingerprint
 * Detecta características da GPU e renderização WebGL
 */
async function gerarWebGLFingerprint(): Promise<{
  fingerprint: string;
  vendor: string;
  renderer: string;
}> {
  try {
    // ✅ Proteção SSR - APIs do navegador só no cliente
    if (typeof window === 'undefined') {
      return {
        fingerprint: 'webgl-ssr-not-supported',
        vendor: 'unknown',
        renderer: 'unknown'
      };
    }
    
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl') as WebGLRenderingContext;
    
    if (!gl) {
      return {
        fingerprint: 'webgl-not-supported',
        vendor: 'unknown',
        renderer: 'unknown'
      };
    }
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    
    const vendor = debugInfo 
      ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL)
      : gl.getParameter(gl.VENDOR);
      
    const renderer = debugInfo
      ? gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
      : gl.getParameter(gl.RENDERER);
    
    // Coletar parâmetros WebGL
    const params = [
      gl.getParameter(gl.VERSION),
      gl.getParameter(gl.SHADING_LANGUAGE_VERSION),
      gl.getParameter(gl.MAX_TEXTURE_SIZE),
      gl.getParameter(gl.MAX_VERTEX_ATTRIBS),
      gl.getParameter(gl.MAX_VERTEX_UNIFORM_VECTORS),
      gl.getParameter(gl.MAX_VARYING_VECTORS),
      gl.getParameter(gl.MAX_FRAGMENT_UNIFORM_VECTORS),
      vendor,
      renderer
    ].join('|');
    
    return {
      fingerprint: params,
      vendor: String(vendor),
      renderer: String(renderer)
    };
  } catch (error) {
    console.error('Erro ao gerar WebGL fingerprint:', error);
    return {
      fingerprint: 'webgl-error',
      vendor: 'unknown',
      renderer: 'unknown'
    };
  }
}

/**
 * Gera Audio Fingerprint
 * Cada dispositivo processa áudio de forma única
 */
async function gerarAudioFingerprint(): Promise<string> {
  try {
    // ✅ Proteção SSR - APIs do navegador só no cliente
    if (typeof window === 'undefined') {
      return 'audio-ssr-not-supported';
    }
    
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    
    if (!AudioContext) return 'audio-not-supported';
    
    const context = new AudioContext();
    const oscillator = context.createOscillator();
    const analyser = context.createAnalyser();
    const gainNode = context.createGain();
    const scriptProcessor = context.createScriptProcessor(4096, 1, 1);
    
    gainNode.gain.value = 0; // Silencioso
    oscillator.type = 'triangle';
    oscillator.frequency.value = 10000;
    
    oscillator.connect(analyser);
    analyser.connect(scriptProcessor);
    scriptProcessor.connect(gainNode);
    gainNode.connect(context.destination);
    
    oscillator.start(0);
    
    return new Promise((resolve) => {
      scriptProcessor.addEventListener('audioprocess', function(event) {
        const output = event.outputBuffer.getChannelData(0);
        const fingerprint = Array.from(output.slice(0, 30))
          .map((n: number) => Math.abs(n).toFixed(10))
          .join('');
        
        oscillator.stop();
        scriptProcessor.disconnect();
        context.close();
        
        resolve(fingerprint);
      });
      
      // Timeout de segurança
      setTimeout(() => {
        oscillator.stop();
        scriptProcessor.disconnect();
        context.close();
        resolve('audio-timeout');
      }, 1000);
    });
  } catch (error) {
    console.error('Erro ao gerar audio fingerprint:', error);
    return 'audio-error';
  }
}

/**
 * Detecta fontes instaladas no sistema
 * Cada dispositivo tem conjunto único de fontes
 */
async function detectarFontes(): Promise<string[]> {
  // ✅ Proteção SSR - APIs do navegador só no cliente
  if (typeof window === 'undefined') {
    return [];
  }
  
  const fontesBase = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia',
    'Palatino', 'Garamond', 'Bookman', 'Comic Sans MS', 'Trebuchet MS',
    'Arial Black', 'Impact', 'Lucida Sans Unicode', 'Tahoma', 'Lucida Console',
    'Monaco', 'Courier', 'Helvetica', 'Calibri', 'Cambria', 'Consolas',
    'Segoe UI', 'Roboto', 'Ubuntu', 'Open Sans', 'Montserrat'
  ];
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  if (!ctx) return [];
  
  const texto = 'mmmmmmmmmmlli';
  const textoBase = '72px monospace';
  
  ctx.font = textoBase;
  const larguraBase = ctx.measureText(texto).width;
  
  const fontesDetectadas: string[] = [];
  
  for (const fonte of fontesBase) {
    ctx.font = `72px "${fonte}", monospace`;
    const largura = ctx.measureText(texto).width;
    
    if (largura !== larguraBase) {
      fontesDetectadas.push(fonte);
    }
  }
  
  return fontesDetectadas;
}

/**
 * Detecta informações do navegador
 */
function detectarNavegador(): {
  navegador: string;
  versao: string;
} {
  // ✅ Proteção SSR - APIs do navegador só no cliente
  if (typeof window === 'undefined') {
    return { navegador: 'Unknown', versao: 'Unknown' };
  }
  
  const ua = navigator.userAgent;
  
  let navegador = 'Unknown';
  let versao = 'Unknown';
  
  if (ua.indexOf('Firefox') > -1) {
    navegador = 'Firefox';
    versao = ua.match(/Firefox\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
    navegador = 'Opera';
    versao = ua.match(/(?:Opera|OPR)\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Edg') > -1) {
    navegador = 'Edge';
    versao = ua.match(/Edg\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Chrome') > -1) {
    navegador = 'Chrome';
    versao = ua.match(/Chrome\/(\d+\.\d+)/)?.[1] || 'Unknown';
  } else if (ua.indexOf('Safari') > -1) {
    navegador = 'Safari';
    versao = ua.match(/Version\/(\d+\.\d+)/)?.[1] || 'Unknown';
  }
  
  return { navegador, versao };
}

/**
 * Detecta sistema operacional
 */
function detectarSistemaOperacional(): string {
  // ✅ Proteção SSR - APIs do navegador só no cliente
  if (typeof window === 'undefined') {
    return 'Unknown';
  }
  
  const ua = navigator.userAgent;
  const platform = navigator.platform;
  
  if (platform.indexOf('Win') > -1) return 'Windows';
  if (platform.indexOf('Mac') > -1) return 'macOS';
  if (platform.indexOf('Linux') > -1) return 'Linux';
  if (platform.indexOf('iPhone') > -1 || platform.indexOf('iPad') > -1) return 'iOS';
  if (ua.indexOf('Android') > -1) return 'Android';
  
  return 'Unknown';
}

/**
 * Detecta tipo de dispositivo
 */
function detectarTipoDispositivo(): string {
  // ✅ Proteção SSR - APIs do navegador só no cliente
  if (typeof window === 'undefined') {
    return 'unknown';
  }
  
  const ua = navigator.userAgent;
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Detecta suporte a touch
 */
function detectarTouchSupport(): boolean {
  // ✅ Proteção SSR - APIs do navegador só no cliente
  if (typeof window === 'undefined') {
    return false;
  }
  
  return (
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0 ||
    (navigator as any).msMaxTouchPoints > 0
  );
}

/**
 * Coleta plugins do navegador
 */
function coletarPlugins(): string[] {
  // ✅ Proteção SSR - APIs do navegador só no cliente
  if (typeof window === 'undefined') {
    return [];
  }
  
  const plugins: string[] = [];
  
  for (let i = 0; i < navigator.plugins.length; i++) {
    const plugin = navigator.plugins[i];
    plugins.push(plugin.name);
  }
  
  return plugins;
}

/**
 * Função principal que gera o fingerprint completo
 */
export async function gerarFingerprint(): Promise<FingerprintData> {
  try {
    // ✅ Proteção SSR - APIs do navegador só no cliente
    if (typeof window === 'undefined') {
      throw new Error('Fingerprint só pode ser gerado no cliente');
    }
    
    // Coletar todos os dados em paralelo
    const [
      canvasFingerprint,
      webglData,
      audioFingerprint,
      fontesDetectadas
    ] = await Promise.all([
      gerarCanvasFingerprint(),
      gerarWebGLFingerprint(),
      gerarAudioFingerprint(),
      detectarFontes()
    ]);
    
    const { navegador, versao: navegadorVersao } = detectarNavegador();
    const sistemaOperacional = detectarSistemaOperacional();
    const dispositivoTipo = detectarTipoDispositivo();
    const touchSupport = detectarTouchSupport();
    const plugins = coletarPlugins();
    
    const data: Omit<FingerprintData, 'fingerprintHash'> = {
      canvasFingerprint,
      webglFingerprint: webglData.fingerprint,
      audioFingerprint,
      platform: navigator.platform,
      cpuCores: navigator.hardwareConcurrency || 0,
      memoria: (navigator as any).deviceMemory || null,
      telaResolucao: `${screen.width}x${screen.height}`,
      telaColorDepth: screen.colorDepth,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      idioma: navigator.language,
      fontesDetectadas,
      userAgent: navigator.userAgent,
      plugins,
      navegador,
      navegadorVersao,
      sistemaOperacional,
      dispositivoTipo,
      touchSupport,
      webglVendor: webglData.vendor,
      webglRenderer: webglData.renderer
    };
    
    // Gerar hash único baseado em todos os dados
    const fingerprintString = JSON.stringify(data);
    const fingerprintHash = await sha256(fingerprintString);
    
    return {
      ...data,
      fingerprintHash
    };
  } catch (error) {
    console.error('Erro ao gerar fingerprint:', error);
    throw error;
  }
}

/**
 * Versão simplificada que retorna apenas o hash
 */
export async function gerarFingerprintHash(): Promise<string> {
  const fingerprint = await gerarFingerprint();
  return fingerprint.fingerprintHash;
}

/**
 * Verifica se dois fingerprints são do mesmo dispositivo
 */
export function compararFingerprints(fp1: string, fp2: string): boolean {
  return fp1 === fp2;
}

