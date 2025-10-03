// API para configurações de status
// Substitui dados hardcoded por dados dinâmicos do banco

import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const status = await prisma.configuracaoStatus.findMany({
      where: { ativo: true },
      orderBy: [{ categoria: 'asc' }, { ordem: 'asc' }]
    });

    res.status(200).json(status);
  } catch (error) {
    console.error('Erro ao buscar status:', error);
    res.status(500).json({ 
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  } finally {
    await prisma.$disconnect();
  }
}
