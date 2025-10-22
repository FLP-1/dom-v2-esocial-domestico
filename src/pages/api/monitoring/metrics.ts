import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getMetrics(req, res);
      case 'POST':
        return await updateMetrics(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de métricas:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getMetrics(req: NextApiRequest, res: NextApiResponse) {
  const { categoria } = req.query;

  const where: any = {};
  if (categoria) where.categoria = categoria as string;

  const metrics = await prisma.metricaSistema.findMany({
    where,
    orderBy: [
      { categoria: 'asc' },
      { chave: 'asc' },
    ],
  });

  // Agrupar métricas por categoria
  const groupedMetrics = metrics.reduce((acc, metric) => {
    if (!acc[metric.categoria]) {
      acc[metric.categoria] = [];
    }
    acc[metric.categoria].push(metric);
    return acc;
  }, {} as Record<string, any[]>);

  return res.status(200).json({ success: true, data: groupedMetrics });
}

async function updateMetrics(req: NextApiRequest, res: NextApiResponse) {
  const { chave, valor, descricao, categoria, dadosExtras } = req.body;

  if (!chave || valor === undefined) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: chave, valor',
    });
  }

  const metric = await prisma.metricaSistema.upsert({
    where: { chave },
    update: {
      valor: parseInt(valor),
      descricao,
      categoria: categoria || 'GERAL',
      dadosExtras,
      atualizadaEm: new Date(),
    },
    create: {
      chave,
      valor: parseInt(valor),
      descricao,
      categoria: categoria || 'GERAL',
      dadosExtras,
    },
  });

  return res.status(200).json({ success: true, data: metric });
}
