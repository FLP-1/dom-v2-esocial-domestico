// src/pages/api/time-clock/aprovar-hora-extra.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { 
      solicitacaoId, 
      status, 
      observacoesAprovacao, 
      motivoRejeicao,
      aprovadoPor 
    } = req.body;

    if (!solicitacaoId || !status || !aprovadoPor) {
      return res.status(400).json({ 
        message: 'ID da solicitação, status e aprovador são obrigatórios' 
      });
    }

    if (!['APROVADO', 'REJEITADO'].includes(status)) {
      return res.status(400).json({ 
        message: 'Status deve ser APROVADO ou REJEITADO' 
      });
    }

    // Buscar solicitação
    const solicitacao = await prisma.solicitacaoHoraExtra.findUnique({
      where: { id: solicitacaoId }
    });

    if (!solicitacao) {
      return res.status(404).json({ 
        message: 'Solicitação não encontrada' 
      });
    }

    if (solicitacao.status !== 'PENDENTE') {
      return res.status(400).json({ 
        message: 'Esta solicitação já foi processada' 
      });
    }

    // Calcular horas aprovadas
    const horasAprovadas = status === 'APROVADO' 
      ? (solicitacao.dataHoraFim.getTime() - solicitacao.dataHoraInicio.getTime()) / (1000 * 60 * 60)
      : 0;

    // Atualizar solicitação
    const solicitacaoAtualizada = await prisma.solicitacaoHoraExtra.update({
      where: { id: solicitacaoId },
      data: {
        status,
        aprovadoPor,
        aprovadoEm: new Date(),
        observacoesAprovacao: status === 'APROVADO' ? observacoesAprovacao : null,
        motivoRejeicao: status === 'REJEITADO' ? motivoRejeicao : null,
        horasAprovadas,
        valorHoraExtra: status === 'APROVADO' ? horasAprovadas * 12.75 : null // TODO: Buscar valor da hora do banco
      }
    });

    // Se aprovada, atualizar resumo de horas
    if (status === 'APROVADO') {
      await atualizarResumoHorasExtras(solicitacao.usuarioId, solicitacao.dataHoraInicio, horasAprovadas);
    }

    // TODO: Enviar notificação para o funcionário

    res.status(200).json({
      message: `Solicitação ${status.toLowerCase()} com sucesso`,
      solicitacao: solicitacaoAtualizada
    });

  } catch (error) {
    console.error('Erro ao aprovar/rejeitar hora extra:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

async function atualizarResumoHorasExtras(usuarioId: string, data: Date, horasExtras: number) {
  try {
    const inicioDia = new Date(data.getFullYear(), data.getMonth(), data.getDate());

    // Buscar resumo do dia
    const resumo = await prisma.resumoHorasTrabalhadas.findUnique({
      where: {
        usuarioId_dataReferencia_periodo: {
          usuarioId,
          dataReferencia: inicioDia,
          periodo: 'DIA'
        }
      }
    });

    if (resumo) {
      await prisma.resumoHorasTrabalhadas.update({
        where: { id: resumo.id },
        data: {
          horasExtrasAprovadas: resumo.horasExtrasAprovadas + horasExtras,
          horasExtrasPendentes: Math.max(0, resumo.horasExtrasPendentes - horasExtras),
          atualizadoEm: new Date()
        }
      });
    }

  } catch (error) {
    console.error('Erro ao atualizar resumo de horas extras:', error);
  }
}
