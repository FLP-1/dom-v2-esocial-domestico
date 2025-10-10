import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const usuarioId = await getCurrentUserId();
    if (!usuarioId) return res.status(401).json({ success: false, error: 'Não autenticado' });

    if (req.method === 'GET') {
      const { status } = req.query;
      const where: any = { usuarioId };
      if (status && typeof status === 'string') where.status = status.toUpperCase();

      const items = await prisma.solicitacaoHoraExtra.findMany({
        where,
        orderBy: { data: 'desc' }
      });
      return res.status(200).json({ success: true, data: items });
    }

    if (req.method === 'POST') {
      const { data, inicio, fim, justificativa } = req.body || {};
      if (!inicio || !fim) return res.status(400).json({ success: false, error: 'Início e fim são obrigatórios (HH:MM)' });
      const dia = data ? new Date(data) : new Date();
      const created = await prisma.solicitacaoHoraExtra.create({
        data: {
          usuarioId,
          data: new Date(dia.getFullYear(), dia.getMonth(), dia.getDate()),
          inicio,
          fim,
          justificativa: justificativa || null,
          status: 'PENDENTE'
        }
      });
      return res.status(201).json({ success: true, data: created });
    }

    if (req.method === 'PATCH') {
      const { id, status, observacao } = req.body || {};
      if (!id || !status) return res.status(400).json({ success: false, error: 'id e status são obrigatórios' });
      const novo = String(status).toUpperCase();
      if (!['APROVADA', 'REJEITADA', 'PENDENTE'].includes(novo)) {
        return res.status(400).json({ success: false, error: 'Status inválido' });
      }
      const updated = await prisma.solicitacaoHoraExtra.update({
        where: { id },
        data: {
          status: novo,
          revisadaPor: usuarioId,
          revisadaEm: novo === 'PENDENTE' ? null : new Date(),
          observacao: observacao || null
        }
      });
      return res.status(200).json({ success: true, data: updated });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PATCH']);
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  } catch (error) {
    console.error('Erro em overtime-requests:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  }
}


