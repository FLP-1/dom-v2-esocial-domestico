import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getActivity(req, res);
      case 'POST':
        return await createActivity(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de atividade:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getActivity(req: NextApiRequest, res: NextApiResponse) {
  const { usuarioId, tipo, limit = '50' } = req.query;

  const where: any = {};
  if (usuarioId) where.usuarioId = usuarioId as string;
  if (tipo) where.tipo = tipo as string;

  const activity = await prisma.atividadeRecente.findMany({
    where,
    include: {
      usuario: {
        select: {
          id: true,
          nomeCompleto: true,
          cpf: true,
          email: true,
        },
      },
    },
    orderBy: {
      criadoEm: 'desc',
    },
    take: parseInt(limit as string),
  });

  return res.status(200).json({ success: true, data: activity });
}

async function createActivity(req: NextApiRequest, res: NextApiResponse) {
  const {
    tipo,
    titulo,
    descricao,
    usuarioId,
    dados,
  } = req.body;

  if (!tipo || !titulo) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: tipo, titulo',
    });
  }

  const activity = await prisma.atividadeRecente.create({
    data: {
      tipo,
      titulo,
      descricao,
      usuarioId,
      dados,
    },
    include: {
      usuario: {
        select: {
          id: true,
          nomeCompleto: true,
          cpf: true,
          email: true,
        },
      },
    },
  });

  return res.status(201).json({ success: true, data: activity });
}
