/**
 * Serviço de Análise de IP
 * Detecta VPN, Proxy, Datacenter, Tor
 * Usa API gratuita ipapi.co
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface DadosIPAnalise {
  ipAddress: string;
  tipo?: string;
  versaoIP?: string;
  hostname?: string;
  isp?: string;
  asn?: string;
  asnOrganizacao?: string;
  cidade?: string;
  regiao?: string;
  pais?: string;
  codigoPais?: string;
  continente?: string;
  latitude?: number;
  longitude?: number;
  timezone?: string;
  isVPN: boolean;
  isProxy: boolean;
  isTor: boolean;
  isDatacenter: boolean;
  isRelay: boolean;
  isMobile: boolean;
  scoreAbuso?: number;
  scoreRisco?: number;
}

/**
 * Consulta API ipapi.co para obter informações do IP
 * API gratuita: 1000 requests/dia
 */
async function consultarIPAPI(ipAddress: string): Promise<Partial<DadosIPAnalise> | null> {
  try {
    // Não consultar IPs locais/privados
    if (isIPPrivado(ipAddress)) {
      return {
        tipo: 'privado',
        isVPN: false,
        isProxy: false,
        isTor: false,
        isDatacenter: false,
        isRelay: false,
        isMobile: false
      };
    }
    
    const response = await fetch(`https://ipapi.co/${ipAddress}/json/`, {
      headers: {
        'User-Agent': 'DOM-Antifraude/1.0'
      }
    });
    
    if (!response.ok) {
      console.error('Erro ao consultar ipapi.co:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // ipapi.co não fornece detecção de VPN/proxy diretamente
    // Mas podemos inferir baseado no ASN e hostname
    const isDatacenter = detectarDatacenter(data.org || '', data.asn || '');
    const isVPN = detectarVPN(data.org || '', data.hostname || '');
    const isProxy = detectarProxy(data.org || '');
    
    return {
      tipo: data.version || 'IPv4',
      versaoIP: data.version || 'IPv4',
      hostname: data.hostname,
      isp: data.org,
      asn: data.asn,
      asnOrganizacao: data.org,
      cidade: data.city,
      regiao: data.region,
      pais: data.country_name,
      codigoPais: data.country_code,
      continente: data.continent_code,
      latitude: data.latitude,
      longitude: data.longitude,
      timezone: data.timezone,
      isVPN,
      isProxy,
      isTor: false, // ipapi.co não detecta Tor
      isDatacenter,
      isRelay: false,
      isMobile: data.org?.toLowerCase().includes('mobile') || false
    };
  } catch (error) {
    console.error('Erro ao consultar ipapi.co:', error);
    return null;
  }
}

/**
 * Verifica se IP é privado/local
 */
function isIPPrivado(ip: string): boolean {
  if (ip === '::1' || ip === '127.0.0.1' || ip === 'localhost') {
    return true;
  }
  
  // Ranges privados IPv4
  const ranges = [
    /^10\./,
    /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
    /^192\.168\./,
    /^127\./,
    /^169\.254\./,
    /^0\.0\.0\.0$/
  ];
  
  return ranges.some(range => range.test(ip));
}

/**
 * Detecta se é datacenter baseado em ASN e organização
 */
function detectarDatacenter(org: string, asn: string): boolean {
  const orgLower = org.toLowerCase();
  
  const keywordsDatacenter = [
    'amazon',
    'aws',
    'google cloud',
    'microsoft azure',
    'digitalocean',
    'linode',
    'ovh',
    'hetzner',
    'vultr',
    'contabo',
    'oracle cloud',
    'alibaba cloud',
    'hosting',
    'data center',
    'datacenter',
    'server',
    'cloud'
  ];
  
  return keywordsDatacenter.some(keyword => orgLower.includes(keyword));
}

/**
 * Detecta VPN baseado em organização e hostname
 */
function detectarVPN(org: string, hostname: string): boolean {
  const orgLower = org.toLowerCase();
  const hostnameLower = hostname?.toLowerCase() || '';
  
  const keywordsVPN = [
    'vpn',
    'proxy',
    'nordvpn',
    'expressvpn',
    'surfshark',
    'cyberghost',
    'private internet access',
    'pia',
    'protonvpn',
    'tunnelbear',
    'windscribe',
    'mullvad'
  ];
  
  return keywordsVPN.some(keyword => 
    orgLower.includes(keyword) || hostnameLower.includes(keyword)
  );
}

/**
 * Detecta proxy
 */
function detectarProxy(org: string): boolean {
  const orgLower = org.toLowerCase();
  
  const keywordsProxy = [
    'proxy',
    'anonymizer',
    'vpn gate',
    'tor exit'
  ];
  
  return keywordsProxy.some(keyword => orgLower.includes(keyword));
}

/**
 * Calcula score de risco baseado nas características do IP
 */
function calcularScoreRisco(dados: Partial<DadosIPAnalise>): number {
  let score = 0;
  
  if (dados.isVPN) score += 0.4;
  if (dados.isProxy) score += 0.4;
  if (dados.isTor) score += 0.8;
  if (dados.isDatacenter) score += 0.5;
  if (dados.isRelay) score += 0.3;
  
  return Math.min(score, 1.0);
}

/**
 * Função principal de análise de IP
 */
export async function analisarIP(ipAddress: string): Promise<DadosIPAnalise> {
  try {
    // Verificar se já temos análise recente (menos de 7 dias)
    const analiseExistente = await prisma.iPAnalysis.findUnique({
      where: { ipAddress }
    });
    
    const seteDiasAtras = new Date();
    seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
    
    if (analiseExistente && analiseExistente.atualizadoEm > seteDiasAtras) {
      // Retornar análise existente
      return {
        ipAddress: analiseExistente.ipAddress,
        tipo: analiseExistente.tipo || undefined,
        versaoIP: analiseExistente.versaoIP || undefined,
        hostname: analiseExistente.hostname || undefined,
        isp: analiseExistente.isp || undefined,
        asn: analiseExistente.asn || undefined,
        asnOrganizacao: analiseExistente.asnOrganizacao || undefined,
        cidade: analiseExistente.cidade || undefined,
        regiao: analiseExistente.regiao || undefined,
        pais: analiseExistente.pais || undefined,
        codigoPais: analiseExistente.codigoPais || undefined,
        continente: analiseExistente.continente || undefined,
        latitude: analiseExistente.latitude || undefined,
        longitude: analiseExistente.longitude || undefined,
        timezone: analiseExistente.timezone || undefined,
        isVPN: analiseExistente.isVPN,
        isProxy: analiseExistente.isProxy,
        isTor: analiseExistente.isTor,
        isDatacenter: analiseExistente.isDatacenter,
        isRelay: analiseExistente.isRelay,
        isMobile: analiseExistente.isMobile,
        scoreAbuso: analiseExistente.scoreAbuso ? Number(analiseExistente.scoreAbuso) : undefined,
        scoreRisco: analiseExistente.scoreRisco ? Number(analiseExistente.scoreRisco) : undefined
      };
    }
    
    // Consultar API
    const dadosAPI = await consultarIPAPI(ipAddress);
    
    if (!dadosAPI) {
      // Fallback: retornar dados básicos
      return {
        ipAddress,
        isVPN: false,
        isProxy: false,
        isTor: false,
        isDatacenter: false,
        isRelay: false,
        isMobile: false,
        scoreRisco: 0.3 // Score médio por falta de informação
      };
    }
    
    const scoreRisco = calcularScoreRisco(dadosAPI);
    
    const dadosCompletos: DadosIPAnalise = {
      ipAddress,
      ...dadosAPI,
      scoreRisco,
      isVPN: false, // Será determinado pela análise
      isProxy: false, // Será determinado pela análise
      isTor: false, // Será determinado pela análise
      isDatacenter: false, // Será determinado pela análise
      isRelay: false, // Será determinado pela análise
      isMobile: false // Será determinado pela análise
    };
    
    // Salvar ou atualizar no banco
    await prisma.iPAnalysis.upsert({
      where: { ipAddress },
      update: {
        tipo: dadosCompletos.tipo,
        versaoIP: dadosCompletos.versaoIP,
        hostname: dadosCompletos.hostname,
        isp: dadosCompletos.isp,
        asn: dadosCompletos.asn,
        asnOrganizacao: dadosCompletos.asnOrganizacao,
        cidade: dadosCompletos.cidade,
        regiao: dadosCompletos.regiao,
        pais: dadosCompletos.pais,
        codigoPais: dadosCompletos.codigoPais,
        continente: dadosCompletos.continente,
        latitude: dadosCompletos.latitude,
        longitude: dadosCompletos.longitude,
        timezone: dadosCompletos.timezone,
        isVPN: dadosCompletos.isVPN,
        isProxy: dadosCompletos.isProxy,
        isTor: dadosCompletos.isTor,
        isDatacenter: dadosCompletos.isDatacenter,
        isRelay: dadosCompletos.isRelay,
        isMobile: dadosCompletos.isMobile,
        scoreRisco: dadosCompletos.scoreRisco,
        vezesVisto: { increment: 1 },
        ultimaVez: new Date()
      },
      create: {
        ipAddress,
        tipo: dadosCompletos.tipo,
        versaoIP: dadosCompletos.versaoIP,
        hostname: dadosCompletos.hostname,
        isp: dadosCompletos.isp,
        asn: dadosCompletos.asn,
        asnOrganizacao: dadosCompletos.asnOrganizacao,
        cidade: dadosCompletos.cidade,
        regiao: dadosCompletos.regiao,
        pais: dadosCompletos.pais,
        codigoPais: dadosCompletos.codigoPais,
        continente: dadosCompletos.continente,
        latitude: dadosCompletos.latitude,
        longitude: dadosCompletos.longitude,
        timezone: dadosCompletos.timezone,
        isVPN: dadosCompletos.isVPN,
        isProxy: dadosCompletos.isProxy,
        isTor: dadosCompletos.isTor,
        isDatacenter: dadosCompletos.isDatacenter,
        isRelay: dadosCompletos.isRelay,
        isMobile: dadosCompletos.isMobile,
        scoreRisco: dadosCompletos.scoreRisco
      }
    });
    
    return dadosCompletos;
  } catch (error) {
    console.error('Erro ao analisar IP:', error);
    
    // Retornar dados mínimos
    return {
      ipAddress,
      isVPN: false,
      isProxy: false,
      isTor: false,
      isDatacenter: false,
      isRelay: false,
      isMobile: false,
      scoreRisco: 0.5
    };
  }
}

/**
 * Bloqueia um IP
 */
export async function bloquearIP(
  ipAddress: string,
  motivo: string
): Promise<void> {
  await prisma.iPAnalysis.update({
    where: { ipAddress },
    data: {
      bloqueado: true,
      motivoBloqueio: motivo
    }
  });
}

/**
 * Desbloqueia um IP
 */
export async function desbloquearIP(ipAddress: string): Promise<void> {
  await prisma.iPAnalysis.update({
    where: { ipAddress },
    data: {
      bloqueado: false,
      motivoBloqueio: null
    }
  });
}

