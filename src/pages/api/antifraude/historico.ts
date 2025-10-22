/**
 * API de Histórico de Análises de Risco
 * GET /api/antifraude/historico?usuarioId=xxx&limit=10
 * 
 * Retorna histórico de análises de risco de um usuário
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
    const { usuarioId, limit = '20', offset = '0' } = req.query;

    if (!usuarioId || typeof usuarioId !== 'string') {
      return res.status(400).json({ error: 'usuarioId é obrigatório' });
    }

    const limitNum = parseInt(limit as string, 10);
    const offsetNum = parseInt(offset as string, 10);

    // Buscar análises de risco
    const analises = await prisma.riskAnalysis.findMany({
      where: { usuarioId },
      orderBy: { criadoEm: 'desc' },
      take: limitNum,
      skip: offsetNum,
      select: {
        id: true,
        tipoEvento: true,
        scoreFinal: true,
        nivelRisco: true,
        sinaisAlerta: true,
        ipAddress: true,
        dispositivoNovo: true,
        ipNovo: true,
        localizacaoNova: true,
        velocidadeImpossivel: true,
        vpnDetectado: true,
        botDetectado: true,
        bloqueado: true,
        criadoEm: true
      }
    });

    // Contar total
    const total = await prisma.riskAnalysis.count({
      where: { usuarioId }
    });

    return res.status(200).json({
      success: true,
      data: analises,
      pagination: {
        total,
        limit: limitNum,
        offset: offsetNum,
        hasMore: total > offsetNum + limitNum
      }
    });
  } catch (error) {
    console.error('Erro ao buscar histórico:', error);
    
    return res.status(500).json({
      error: 'Erro ao buscar histórico',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

