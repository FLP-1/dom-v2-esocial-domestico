import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const usuarioId = await getCurrentUserId();
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Não autenticado' });
    }

    const last = await prisma.registroPonto.findFirst({
      where: { usuarioId },
      orderBy: { dataHora: 'desc' }
    });

    if (!last) {
      return res.status(200).json({ success: true, data: null });
    }

    return res.status(200).json({ success: true, data: last });
  } catch (error) {
    console.error('Erro em /api/time-clock/last', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}


