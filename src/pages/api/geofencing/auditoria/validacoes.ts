// API para validações de auditoria de geofencing
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
      dentroGeofence, 
      dataInicio, 
      dataFim, 
      usuario, 
      page = 1, 
      limit = 50 
    } = req.query;

    // Construir filtros
    const where: any = {};
    
    if (dentroGeofence !== undefined) {
      where.dentroGeofence = dentroGeofence === 'true';
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

    // Buscar validações com paginação
    const skip = (Number(page) - 1) * Number(limit);
    
    const [validacoes, total] = await Promise.all([
      prisma.geofencingValidacao.findMany({
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
      prisma.geofencingValidacao.count({ where })
    ]);

    // Estatísticas
    const stats = await prisma.geofencingValidacao.aggregate({
      where,
      _count: {
        dentroGeofence: true
      },
      _avg: {
        distancia: true,
        precisao: true
      }
    });

    const dentroGeofenceCount = await prisma.geofencingValidacao.count({
      where: {
        ...where,
        dentroGeofence: true
      }
    });

    return res.status(200).json({
      validacoes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      stats: {
        total: stats._count.dentroGeofence,
        dentroGeofence: dentroGeofenceCount,
        foraGeofence: total - dentroGeofenceCount,
        distanciaMedia: stats._avg.distancia,
        precisaoMedia: stats._avg.precisao
      }
    });

  } catch (error) {
    console.error('Erro na API de validações de auditoria:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
