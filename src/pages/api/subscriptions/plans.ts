import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const planos = await prisma.planoAssinatura.findMany({
        where: {
          ativo: true,
        },
        include: {
          assinaturas: {
            where: {
              status: 'ATIVA',
            },
            include: {
              usuario: {
                select: {
                  nomeCompleto: true,
                  apelido: true,
                },
              },
            },
          },
        },
        orderBy: {
          ordem: 'asc',
        },
      });

      const planosFormatados = planos.map(plano => ({
        id: plano.id,
        code: plano.codigo,
        name: plano.nome,
        tagline: plano.tagline,
        description: plano.descricao,
        pricing: {
          monthly: Number(plano.precoMensal),
          yearly: Number(plano.precoAnual),
          discount: plano.descontoAnual,
        },
        features: plano.recursos,
        limits: plano.limitesRecursos,
        badges: {
          isPopular: plano.popular,
          isRecommended: plano.recomendado,
          isFree: plano.gratuito,
          isPartnership: plano.parceria,
        },
        isActive: plano.ativo,
        order: plano.ordem,
        activeSubscriptions: plano.assinaturas.length,
        subscribers: plano.assinaturas.map(s => ({
          userId: s.usuarioId,
          userName: s.usuario.apelido || s.usuario.nomeCompleto,
          billingType: s.tipoCobranca,
          startDate: s.inicioEm.toISOString().split('T')[0],
          nextBillingDate: s.proximaCobrancaEm?.toISOString().split('T')[0],
          currentValue: Number(s.valorAtual),
        })),
      }));

      return res.status(200).json({ success: true, data: planosFormatados });
    } catch (error) {
      console.error('Erro ao buscar planos:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar planos' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

