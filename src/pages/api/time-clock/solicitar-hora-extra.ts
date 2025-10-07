// src/pages/api/time-clock/solicitar-hora-extra.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { 
      usuarioId, 
      dataHoraInicio, 
      dataHoraFim, 
      justificativa 
    } = req.body;

    if (!usuarioId || !dataHoraInicio || !dataHoraFim || !justificativa) {
      return res.status(400).json({ 
        message: 'Todos os campos são obrigatórios' 
      });
    }

    // Validar datas
    const inicio = new Date(dataHoraInicio);
    const fim = new Date(dataHoraFim);

    if (inicio >= fim) {
      return res.status(400).json({ 
        message: 'A data de início deve ser anterior à data de fim' 
      });
    }

    if (inicio < new Date()) {
      return res.status(400).json({ 
        message: 'A data de início não pode ser no passado' 
      });
    }

    // Verificar se já existe solicitação para o mesmo período
    const solicitacaoExistente = await prisma.solicitacaoHoraExtra.findFirst({
      where: {
        usuarioId,
        dataHoraInicio: {
          lte: fim
        },
        dataHoraFim: {
          gte: inicio
        },
        status: {
          in: ['PENDENTE', 'APROVADO']
        }
      }
    });

    if (solicitacaoExistente) {
      return res.status(400).json({ 
        message: 'Já existe uma solicitação de hora extra para este período' 
      });
    }

    // Criar solicitação
    const novaSolicitacao = await prisma.solicitacaoHoraExtra.create({
      data: {
        usuarioId,
        dataHoraInicio: inicio,
        dataHoraFim: fim,
        justificativa,
        status: 'PENDENTE'
      }
    });

    // TODO: Enviar notificação para o supervisor/empregador

    res.status(201).json({
      message: 'Solicitação de hora extra criada com sucesso',
      solicitacao: novaSolicitacao
    });

  } catch (error) {
    console.error('Erro ao solicitar hora extra:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
