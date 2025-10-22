/**
 * Serviço de Análise de Risco - Server Side
 * Calcula score de risco baseado em múltiplos fatores
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DadosAnaliseRisco {
  usuarioId?: string;
  fingerprintHash: string;
  fingerprintData: any;
  ipAddress: string;
  geolocalizacao?: {
    latitude: number;
    longitude: number;
    precisao?: number;
  };
  comportamento?: any;
  tipoEvento: string;
}

export interface ResultadoAnaliseRisco {
  scoreFinal: number;
  nivelRisco: 'BAIXO' | 'MEDIO' | 'ALTO' | 'CRITICO';
  scoreFingerprint: number;
  scoreIP: number;
  scoreGeolocalizacao: number;
  scoreComportamento: number;
  scoreTemporal: number;
  sinaisAlerta: string[];
  dispositivoNovo: boolean;
  ipNovo: boolean;
  localizacaoNova: boolean;
  velocidadeImpossivel: boolean;
  horaAtipica: boolean;
  vpnDetectado: boolean;
  proxyDetectado: boolean;
  datacenterDetectado: boolean;
  botDetectado: boolean;
  acaoRecomendada: string;
  bloqueado: boolean;
}

/**
 * Analisa fingerprint e retorna score de risco
 */
async function analisarFingerprint(
  fingerprintHash: string,
  usuarioId?: string
): Promise<{ score: number; novo: boolean; bloqueado: boolean }> {
  try {
    // Buscar fingerprint existente
    const fingerprintExistente = await prisma.deviceFingerprint.findUnique({
      where: { fingerprintHash }
    });
    
    if (!fingerprintExistente) {
      // Novo dispositivo
      return { score: 0.3, novo: true, bloqueado: false };
    }
    
    // Verificar se está bloqueado
    if (fingerprintExistente.bloqueado) {
      return { score: 1.0, novo: false, bloqueado: true };
    }
    
    // Dispositivo conhecido
    if (fingerprintExistente.confiavel) {
      return { score: 0.0, novo: false, bloqueado: false };
    }
    
    // Verificar se usuário está associado
    if (usuarioId && fingerprintExistente.usuarioId === usuarioId) {
      return { score: 0.1, novo: false, bloqueado: false };
    }
    
    // Dispositivo visto, mas não totalmente confiável
    return { score: 0.2, novo: false, bloqueado: false };
  } catch (error) {
    console.error('Erro ao analisar fingerprint:', error);
    return { score: 0.5, novo: true, bloqueado: false };
  }
}

/**
 * Analisa IP e retorna score de risco
 */
async function analisarIP(ipAddress: string): Promise<{
  score: number;
  novo: boolean;
  isVPN: boolean;
  isProxy: boolean;
  isDatacenter: boolean;
  bloqueado: boolean;
}> {
  try {
    // Buscar análise de IP existente
    const ipAnalise = await prisma.iPAnalysis.findUnique({
      where: { ipAddress }
    });
    
    if (!ipAnalise) {
      // Novo IP - precisará ser analisado
      return {
        score: 0.2,
        novo: true,
        isVPN: false,
        isProxy: false,
        isDatacenter: false,
        bloqueado: false
      };
    }
    
    // Verificar se está bloqueado
    if (ipAnalise.bloqueado) {
      return {
        score: 1.0,
        novo: false,
        isVPN: ipAnalise.isVPN,
        isProxy: ipAnalise.isProxy,
        isDatacenter: ipAnalise.isDatacenter,
        bloqueado: true
      };
    }
    
    let score = 0;
    
    // VPN/Proxy aumentam risco
    if (ipAnalise.isVPN) score += 0.4;
    if (ipAnalise.isProxy) score += 0.4;
    if (ipAnalise.isDatacenter) score += 0.5;
    if (ipAnalise.isTor) score += 0.8;
    
    // Score de risco do IP
    if (ipAnalise.scoreRisco) {
      score += Number(ipAnalise.scoreRisco);
    }
    
    return {
      score: Math.min(score, 1.0),
      novo: false,
      isVPN: ipAnalise.isVPN,
      isProxy: ipAnalise.isProxy,
      isDatacenter: ipAnalise.isDatacenter,
      bloqueado: false
    };
  } catch (error) {
    console.error('Erro ao analisar IP:', error);
    return {
      score: 0.3,
      novo: true,
      isVPN: false,
      isProxy: false,
      isDatacenter: false,
      bloqueado: false
    };
  }
}

/**
 * Calcula distância entre duas coordenadas (fórmula de Haversine)
 */
function calcularDistanciaKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Raio da Terra em km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Analisa geolocalização e detecta impossibilidades
 */
async function analisarGeolocalizacao(
  geolocalizacao: { latitude: number; longitude: number },
  usuarioId?: string
): Promise<{
  score: number;
  nova: boolean;
  velocidadeImpossivel: boolean;
  distanciaKm?: number;
}> {
  try {
    if (!usuarioId) {
      return { score: 0.1, nova: true, velocidadeImpossivel: false };
    }
    
    // Buscar última localização do usuário
    const ultimaLocalizacao = await prisma.geolocationHistory.findFirst({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' }
    });
    
    if (!ultimaLocalizacao) {
      return { score: 0.1, nova: true, velocidadeImpossivel: false };
    }
    
    // Calcular distância
    const distanciaKm = calcularDistanciaKm(
      ultimaLocalizacao.latitude,
      ultimaLocalizacao.longitude,
      geolocalizacao.latitude,
      geolocalizacao.longitude
    );
    
    // Calcular tempo decorrido (em horas)
    const tempoDecorridoMs = Date.now() - ultimaLocalizacao.criadoEm.getTime();
    const tempoDecorridoHoras = tempoDecorridoMs / (1000 * 60 * 60);
    
    // Calcular velocidade necessária (km/h)
    const velocidadeNecessaria = distanciaKm / Math.max(tempoDecorridoHoras, 0.001);
    
    // Velocidade máxima possível de avião comercial ~900 km/h
    // Considerando 1000 km/h para margem de segurança
    const velocidadeImpossivel = velocidadeNecessaria > 1000;
    
    let score = 0;
    
    if (velocidadeImpossivel) {
      score = 0.9; // Muito suspeito
    } else if (distanciaKm > 500) {
      score = 0.3; // Mudança geográfica significativa
    } else if (distanciaKm > 100) {
      score = 0.1; // Mudança moderada
    }
    
    return {
      score,
      nova: distanciaKm > 50,
      velocidadeImpossivel,
      distanciaKm
    };
  } catch (error) {
    console.error('Erro ao analisar geolocalização:', error);
    return { score: 0.2, nova: true, velocidadeImpossivel: false };
  }
}

/**
 * Analisa comportamento e detecta bots
 */
function analisarComportamento(comportamento?: any): {
  score: number;
  botDetectado: boolean;
} {
  if (!comportamento) {
    return { score: 0.1, botDetectado: false };
  }
  
  const {
    scoreBotProbabilidade,
    scoreNormalidade,
    padraoHumano,
    regularidadeExcessiva,
    acoesMuitoRapidas
  } = comportamento;
  
  let score = 0;
  
  if (scoreBotProbabilidade > 0.7) {
    score = 0.8;
  } else if (scoreBotProbabilidade > 0.4) {
    score = 0.4;
  }
  
  if (!padraoHumano) {
    score += 0.3;
  }
  
  if (regularidadeExcessiva) {
    score += 0.2;
  }
  
  if (acoesMuitoRapidas) {
    score += 0.2;
  }
  
  const botDetectado = score > 0.6 || scoreBotProbabilidade > 0.7;
  
  return {
    score: Math.min(score, 1.0),
    botDetectado
  };
}

/**
 * Analisa horário de acesso
 */
function analisarHorario(): { score: number; atipico: boolean } {
  const agora = new Date();
  const hora = agora.getHours();
  
  // Horários atípicos: 02:00 - 05:00 (madrugada)
  const atipico = hora >= 2 && hora < 5;
  
  return {
    score: atipico ? 0.2 : 0.0,
    atipico
  };
}

/**
 * Função principal de análise de risco
 */
export async function analisarRisco(
  dados: DadosAnaliseRisco
): Promise<ResultadoAnaliseRisco> {
  try {
    // Análises paralelas
    const [
      analiseFingerprint,
      analiseIP,
      analiseGeo,
      analiseComp,
      analiseTemporal
    ] = await Promise.all([
      analisarFingerprint(dados.fingerprintHash, dados.usuarioId),
      analisarIP(dados.ipAddress),
      dados.geolocalizacao
        ? analisarGeolocalizacao(dados.geolocalizacao, dados.usuarioId)
        : Promise.resolve({ score: 0, nova: false, velocidadeImpossivel: false }),
      Promise.resolve(analisarComportamento(dados.comportamento)),
      Promise.resolve(analisarHorario())
    ]);
    
    // Calcular score final ponderado
    const scoreFingerprint = analiseFingerprint.score * 0.25;
    const scoreIP = analiseIP.score * 0.30;
    const scoreGeolocalizacao = analiseGeo.score * 0.20;
    const scoreComportamento = analiseComp.score * 0.20;
    const scoreTemporal = analiseTemporal.score * 0.05;
    
    const scoreFinal = 
      scoreFingerprint +
      scoreIP +
      scoreGeolocalizacao +
      scoreComportamento +
      scoreTemporal;
    
    // Determinar nível de risco
    let nivelRisco: ResultadoAnaliseRisco['nivelRisco'];
    if (scoreFinal >= 0.8) nivelRisco = 'CRITICO';
    else if (scoreFinal >= 0.6) nivelRisco = 'ALTO';
    else if (scoreFinal >= 0.4) nivelRisco = 'MEDIO';
    else nivelRisco = 'BAIXO';
    
    // Coletar sinais de alerta
    const sinaisAlerta: string[] = [];
    if (analiseFingerprint.novo) sinaisAlerta.push('Dispositivo novo');
    if (analiseFingerprint.bloqueado) sinaisAlerta.push('Dispositivo bloqueado');
    if (analiseIP.novo) sinaisAlerta.push('IP novo');
    if (analiseIP.bloqueado) sinaisAlerta.push('IP bloqueado');
    if (analiseIP.isVPN) sinaisAlerta.push('VPN detectada');
    if (analiseIP.isProxy) sinaisAlerta.push('Proxy detectado');
    if (analiseIP.isDatacenter) sinaisAlerta.push('IP de datacenter');
    if (analiseGeo.nova) sinaisAlerta.push('Localização nova');
    if (analiseGeo.velocidadeImpossivel) sinaisAlerta.push('Velocidade de deslocamento impossível');
    if (analiseComp.botDetectado) sinaisAlerta.push('Comportamento de bot detectado');
    if (analiseTemporal.atipico) sinaisAlerta.push('Horário atípico');
    
    // Determinar ação recomendada
    let acaoRecomendada = 'Permitir';
    let bloqueado = false;
    
    if (analiseFingerprint.bloqueado || analiseIP.bloqueado) {
      acaoRecomendada = 'Bloquear';
      bloqueado = true;
    } else if (nivelRisco === 'CRITICO') {
      acaoRecomendada = 'Bloquear';
      bloqueado = true;
    } else if (nivelRisco === 'ALTO') {
      acaoRecomendada = 'Solicitar 2FA';
    } else if (nivelRisco === 'MEDIO') {
      acaoRecomendada = 'Monitorar';
    }
    
    return {
      scoreFinal,
      nivelRisco,
      scoreFingerprint,
      scoreIP,
      scoreGeolocalizacao,
      scoreComportamento,
      scoreTemporal,
      sinaisAlerta,
      dispositivoNovo: analiseFingerprint.novo,
      ipNovo: analiseIP.novo,
      localizacaoNova: analiseGeo.nova,
      velocidadeImpossivel: analiseGeo.velocidadeImpossivel,
      horaAtipica: analiseTemporal.atipico,
      vpnDetectado: analiseIP.isVPN,
      proxyDetectado: analiseIP.isProxy,
      datacenterDetectado: analiseIP.isDatacenter,
      botDetectado: analiseComp.botDetectado,
      acaoRecomendada,
      bloqueado
    };
  } catch (error) {
    console.error('Erro ao analisar risco:', error);
    
    // Em caso de erro, retornar risco médio para não bloquear indevidamente
    return {
      scoreFinal: 0.5,
      nivelRisco: 'MEDIO',
      scoreFingerprint: 0.5,
      scoreIP: 0.5,
      scoreGeolocalizacao: 0,
      scoreComportamento: 0,
      scoreTemporal: 0,
      sinaisAlerta: ['Erro ao processar análise'],
      dispositivoNovo: false,
      ipNovo: false,
      localizacaoNova: false,
      velocidadeImpossivel: false,
      horaAtipica: false,
      vpnDetectado: false,
      proxyDetectado: false,
      datacenterDetectado: false,
      botDetectado: false,
      acaoRecomendada: 'Monitorar',
      bloqueado: false
    };
  }
}

/**
 * Salva análise de risco no banco de dados
 */
export async function salvarAnaliseRisco(
  dados: DadosAnaliseRisco,
  resultado: ResultadoAnaliseRisco
): Promise<void> {
  try {
    // Salvar ou atualizar fingerprint
    const fingerprint = await prisma.deviceFingerprint.upsert({
      where: { fingerprintHash: dados.fingerprintHash },
      update: {
        vezesVisto: { increment: 1 },
        ultimaVez: new Date(),
        usuarioId: dados.usuarioId || undefined
      },
      create: {
        fingerprintHash: dados.fingerprintHash,
        canvasFingerprint: dados.fingerprintData.canvasFingerprint,
        webglFingerprint: dados.fingerprintData.webglFingerprint,
        audioFingerprint: dados.fingerprintData.audioFingerprint,
        platform: dados.fingerprintData.platform,
        cpuCores: dados.fingerprintData.cpuCores,
        memoria: dados.fingerprintData.memoria,
        telaResolucao: dados.fingerprintData.telaResolucao,
        telaColorDepth: dados.fingerprintData.telaColorDepth,
        timezone: dados.fingerprintData.timezone,
        idioma: dados.fingerprintData.idioma,
        fontesDetectadas: dados.fingerprintData.fontesDetectadas,
        userAgent: dados.fingerprintData.userAgent,
        plugins: dados.fingerprintData.plugins,
        navegador: dados.fingerprintData.navegador,
        navegadorVersao: dados.fingerprintData.navegadorVersao,
        sistemaOperacional: dados.fingerprintData.sistemaOperacional,
        dispositivoTipo: dados.fingerprintData.dispositivoTipo,
        touchSupport: dados.fingerprintData.touchSupport,
        webglVendor: dados.fingerprintData.webglVendor,
        webglRenderer: dados.fingerprintData.webglRenderer,
        usuarioId: dados.usuarioId || null
      }
    });
    
    // Salvar geolocalização se fornecida
    let geoId: string | undefined;
    if (dados.geolocalizacao) {
      const geo = await prisma.geolocationHistory.create({
        data: {
          latitude: dados.geolocalizacao.latitude,
          longitude: dados.geolocalizacao.longitude,
          precisao: dados.geolocalizacao.precisao,
          usuarioId: dados.usuarioId || null,
          fingerprintId: fingerprint.id,
          suspeita: resultado.velocidadeImpossivel,
          motivoSuspeita: resultado.velocidadeImpossivel 
            ? 'Velocidade de deslocamento impossível'
            : null
        }
      });
      geoId = geo.id;
    }
    
    // Salvar análise de risco
    await prisma.riskAnalysis.create({
      data: {
        usuarioId: dados.usuarioId || null,
        fingerprintId: fingerprint.id,
        ipAddress: dados.ipAddress,
        geolocalizacaoId: geoId,
        tipoEvento: dados.tipoEvento,
        scoreFinal: resultado.scoreFinal,
        nivelRisco: resultado.nivelRisco,
        scoreFingerprint: resultado.scoreFingerprint,
        scoreIP: resultado.scoreIP,
        scoreGeolocalizacao: resultado.scoreGeolocalizacao,
        scoreComportamento: resultado.scoreComportamento,
        scoreTemporal: resultado.scoreTemporal,
        sinaisAlerta: resultado.sinaisAlerta,
        dispositivoNovo: resultado.dispositivoNovo,
        ipNovo: resultado.ipNovo,
        localizacaoNova: resultado.localizacaoNova,
        velocidadeImpossivel: resultado.velocidadeImpossivel,
        horaAtipica: resultado.horaAtipica,
        vpnDetectado: resultado.vpnDetectado,
        proxyDetectado: resultado.proxyDetectado,
        datacenterDetectado: resultado.datacenterDetectado,
        botDetectado: resultado.botDetectado,
        acaoTomada: resultado.acaoRecomendada,
        bloqueado: resultado.bloqueado,
        dadosCompletos: {
          fingerprintData: dados.fingerprintData,
          comportamento: dados.comportamento
        }
      }
    });
  } catch (error) {
    console.error('Erro ao salvar análise de risco:', error);
    // Não lançar erro para não interromper o fluxo
  }
}

