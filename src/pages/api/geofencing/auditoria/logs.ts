// API para logs de auditoria de geofencing
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // TODO: Implementar autenticação adequada
  // const session = await getServerSession(req, res, authOptions);
  // if (!session?.user?.id) {
  //   return res.status(401).json({ error: 'Não autorizado' });
  // }

  try {
    const { 
      acao, 
      dataInicio, 
      dataFim, 
      usuario, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Construir filtros
    const where: any = {};
    
    if (acao) {
      where.acao = acao;
    }
    
    if (dataInicio || dataFim) {
      where.timestamp = {};
      if (dataInicio) {
        where.timestamp.gte = new Date(dataInicio as string);
      }
      if (dataFim) {
        where.timestamp.lte = new Date(dataFim as string);
      }
    }
    
    if (usuario) {
      where.usuario = {
        nomeCompleto: {
          contains: usuario as string,
          mode: 'insensitive'
        }
      };
    }

    // Buscar logs com paginação
    const skip = (Number(page) - 1) * Number(limit);
    
    const [logs, total] = await Promise.all([
      prisma.geofencingLog.findMany({
        where,
        include: {
          usuario: {
            select: {
              nomeCompleto: true
            }
          },
          localTrabalho: {
            select: {
              nome: true
            }
          }
        },
        orderBy: {
          timestamp: 'desc'
        },
        skip,
        take: Number(limit)
      }),
      prisma.geofencingLog.count({ where })
    ]);

    return res.status(200).json({
      logs,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });

  } catch (error) {
    console.error('Erro na API de logs de auditoria:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
