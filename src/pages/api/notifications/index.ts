import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { usuarioId, tipo, categoria, lida, enviada } = req.query;

      const whereClause: any = {};
      
      if (usuarioId) whereClause.usuarioId = usuarioId;
      if (tipo) whereClause.tipo = tipo;
      if (categoria) whereClause.categoria = categoria;
      if (lida !== undefined) whereClause.lida = lida === 'true';
      if (enviada !== undefined) whereClause.enviada = enviada === 'true';

      const notificacoes = await prisma.notificacao.findMany({
        where: whereClause,
        orderBy: {
          criadoEm: 'desc',
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: notificacoes 
      });
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar notificações' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        usuarioId,
        tipo, 
        titulo, 
        mensagem, 
        categoria, 
        prioridade,
        dadosAcao,
        dataExpiracao 
      } = req.body;
      
      if (!tipo || !titulo || !mensagem || !categoria || !prioridade) {
        return res.status(400).json({
          success: false,
          error: 'tipo, titulo, mensagem, categoria e prioridade são obrigatórios'
        });
      }

      const notificacao = await prisma.notificacao.create({
        data: {
          usuarioId,
          tipo,
          titulo,
          mensagem,
          categoria,
          prioridade,
          dadosAcao,
          dataExpiracao: dataExpiracao ? new Date(dataExpiracao) : null,
          lida: false,
          enviada: false,
        },
      });

      return res.status(201).json({ 
        success: true, 
        data: notificacao 
      });
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar notificação' 
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { 
        id,
        lida,
        enviada,
        dataLeitura,
        dataEnvio 
      } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id é obrigatório'
        });
      }

      const updateData: any = {};
      
      if (lida !== undefined) {
        updateData.lida = lida;
        if (lida && !dataLeitura) {
          updateData.dataLeitura = new Date();
        }
      }
      
      if (enviada !== undefined) {
        updateData.enviada = enviada;
        if (enviada && !dataEnvio) {
          updateData.dataEnvio = new Date();
        }
      }

      const notificacao = await prisma.notificacao.update({
        where: { id },
        data: updateData,
      });

      return res.status(200).json({ 
        success: true, 
        data: notificacao 
      });
    } catch (error) {
      console.error('Erro ao atualizar notificação:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao atualizar notificação' 
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id é obrigatório'
        });
      }

      await prisma.notificacao.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Notificação removida com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao remover notificação:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao remover notificação' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
