/**
 * API de Estatísticas de Antifraude
 * GET /api/antifraude/estatisticas
 * 
 * Retorna estatísticas gerais do sistema antifraude
 * Requer permissão de admin
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Obter estatísticas agregadas
    const [
      totalAnalises,
      analisesHoje,
      analisesSemana,
      analisesAltoRisco,
      analisesBloqueadas,
      dispositivosNovos,
      ipsNovos,
      vpnsDetectadas,
      botsDetectados,
      velocidadesImpossiveis
    ] = await Promise.all([
      // Total de análises
      prisma.riskAnalysis.count(),
      
      // Análises hoje
      prisma.riskAnalysis.count({
        where: {
          criadoEm: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Análises últimos 7 dias
      prisma.riskAnalysis.count({
        where: {
          criadoEm: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Alto risco
      prisma.riskAnalysis.count({
        where: {
          nivelRisco: { in: ['ALTO', 'CRITICO'] }
        }
      }),
      
      // Bloqueadas
      prisma.riskAnalysis.count({
        where: { bloqueado: true }
      }),
      
      // Dispositivos novos
      prisma.riskAnalysis.count({
        where: { dispositivoNovo: true }
      }),
      
      // IPs novos
      prisma.riskAnalysis.count({
        where: { ipNovo: true }
      }),
      
      // VPNs detectadas
      prisma.riskAnalysis.count({
        where: { vpnDetectado: true }
      }),
      
      // Bots detectados
      prisma.riskAnalysis.count({
        where: { botDetectado: true }
      }),
      
      // Velocidades impossíveis
      prisma.riskAnalysis.count({
        where: { velocidadeImpossivel: true }
      })
    ]);

    // Estatísticas por nível de risco
    const porNivelRisco = await prisma.riskAnalysis.groupBy({
      by: ['nivelRisco'],
      _count: true
    });

    // Top 10 IPs mais vistos
    const topIPs = await prisma.iPAnalysis.findMany({
      orderBy: { vezesVisto: 'desc' },
      take: 10,
      select: {
        ipAddress: true,
        vezesVisto: true,
        pais: true,
        cidade: true,
        isVPN: true,
        isProxy: true,
        isDatacenter: true,
        bloqueado: true
      }
    });

    // Dispositivos únicos
    const dispositivosUnicos = await prisma.deviceFingerprint.count();

    // IPs únicos
    const ipsUnicos = await prisma.iPAnalysis.count();

    // Taxa de bloqueio
    const taxaBloqueio = totalAnalises > 0 
      ? (analisesBloqueadas / totalAnalises * 100).toFixed(2)
      : '0.00';

    // Taxa de alto risco
    const taxaAltoRisco = totalAnalises > 0
      ? (analisesAltoRisco / totalAnalises * 100).toFixed(2)
      : '0.00';

    return res.status(200).json({
      success: true,
      estatisticas: {
        totais: {
          analises: totalAnalises,
          analisesHoje,
          analisesSemana,
          dispositivosUnicos,
          ipsUnicos
        },
        deteccoes: {
          altoRisco: analisesAltoRisco,
          bloqueadas: analisesBloqueadas,
          dispositivosNovos,
          ipsNovos,
          vpns: vpnsDetectadas,
          bots: botsDetectados,
          velocidadesImpossiveis
        },
        taxas: {
          bloqueio: parseFloat(taxaBloqueio),
          altoRisco: parseFloat(taxaAltoRisco)
        },
        distribuicao: {
          porNivelRisco: porNivelRisco.map(item => ({
            nivel: item.nivelRisco,
            quantidade: item._count
          }))
        },
        topIPs
      }
    });
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error);
    
    return res.status(500).json({
      error: 'Erro ao buscar estatísticas',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

