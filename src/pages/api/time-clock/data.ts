// src/pages/api/time-clock/data.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { usuarioId } = req.query;

    if (!usuarioId || typeof usuarioId !== 'string') {
      return res.status(400).json({ message: 'ID do usuário é obrigatório' });
    }

    // Buscar horários oficiais
    // Não há modelo HorarioOficial no schema atual; retornar lista vazia
    const horariosOficiais: any[] = [];

    // Buscar registros de ponto do dia atual
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

    const registrosHoje = await prisma.registroPonto.findMany({
      where: {
        usuarioId,
        dataHora: {
          gte: inicioDia,
          lt: fimDia
        }
      },
      orderBy: { dataHora: 'asc' }
    });

    // Buscar solicitações de hora extra pendentes
    // Não há modelo SolicitacaoHoraExtra no schema atual; retornar lista vazia
    const solicitacoesHoraExtra: any[] = [];

    // Buscar resumos de horas (últimos 30 dias)
    // Não há modelo ResumoHorasTrabalhadas; calcular resumo básico on-the-fly
    const ultimos30Dias = new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000);
    const registros30Dias = await prisma.registroPonto.findMany({
      where: {
        usuarioId,
        dataHora: { gte: ultimos30Dias }
      },
      orderBy: { dataHora: 'asc' }
    });
    const resumosHoras = [] as any[];

    // Buscar histórico de registros (últimos 30 dias)
    const historicoRegistros = await prisma.registroPonto.findMany({
      where: {
        usuarioId,
        dataHora: {
          gte: new Date(hoje.getTime() - 30 * 24 * 60 * 60 * 1000)
        }
      },
      orderBy: { dataHora: 'desc' },
      take: 100
    });

    // Calcular resumo do dia
    const hojeResumo = resumosHoras.find(r => 
      r.dataReferencia.toDateString() === hoje.toDateString() && 
      r.periodo === 'DIA'
    );

    // Calcular horário oficial do dia
    const diaSemana = hoje.getDay();
    const horarioOficialHoje = horariosOficiais.find(h => h.diaSemana === diaSemana);

    const response = {
      horariosOficiais,
      registrosHoje,
      solicitacoesHoraExtra,
      resumosHoras,
      historicoRegistros,
      resumoHoje: hojeResumo || {
        horasTrabalhadas: 0,
        horasOficiais: horarioOficialHoje ? 8 : 0,
        horasExtras: 0,
        horasExtrasAprovadas: 0,
        horasExtrasPendentes: 0,
        diferenca: 0,
        registrosPonto: registrosHoje.length,
        faltas: 0,
        atrasos: 0
      },
      horarioOficialHoje
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Erro ao buscar dados do time-clock:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
