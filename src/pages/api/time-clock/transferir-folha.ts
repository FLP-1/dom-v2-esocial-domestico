// src/pages/api/time-clock/transferir-folha.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { 
      usuarioId, 
      mesReferencia, 
      anoReferencia 
    } = req.body;

    if (!usuarioId || !mesReferencia || !anoReferencia) {
      return res.status(400).json({ 
        message: 'Usuário, mês e ano são obrigatórios' 
      });
    }

    // Verificar se já existe transferência para este período
    const transferenciaExistente = await prisma.transferenciaFolha.findUnique({
      where: {
        usuarioId_mesReferencia_anoReferencia: {
          usuarioId,
          mesReferencia,
          anoReferencia
        }
      }
    });

    if (transferenciaExistente) {
      return res.status(400).json({ 
        message: 'Já existe uma transferência para este período' 
      });
    }

    // Calcular totais do período
    const inicioMes = new Date(anoReferencia, mesReferencia - 1, 1);
    const fimMes = new Date(anoReferencia, mesReferencia, 0, 23, 59, 59);

    const resumos = await prisma.resumoHorasTrabalhadas.findMany({
      where: {
        usuarioId,
        dataReferencia: {
          gte: inicioMes,
          lte: fimMes
        },
        periodo: 'DIA'
      }
    });

    // Calcular totais
    const totalHorasTrabalhadas = resumos.reduce((sum, r) => sum + r.horasTrabalhadas, 0);
    const totalHorasExtras = resumos.reduce((sum, r) => sum + r.horasExtras, 0);
    const totalHorasExtrasAprovadas = resumos.reduce((sum, r) => sum + r.horasExtrasAprovadas, 0);

    // Calcular valor total (assumindo R$ 12,75 por hora extra)
    const valorTotal = totalHorasExtrasAprovadas * 12.75;

    // Criar transferência
    const novaTransferencia = await prisma.transferenciaFolha.create({
      data: {
        usuarioId,
        mesReferencia,
        anoReferencia,
        totalHorasTrabalhadas,
        totalHorasExtras,
        totalHorasExtrasAprovadas,
        valorTotal,
        status: 'PROCESSADO',
        processadoEm: new Date(),
        dadosTransferencia: {
          resumos: resumos.map(r => ({
            data: r.dataReferencia,
            horasTrabalhadas: r.horasTrabalhadas,
            horasExtras: r.horasExtras,
            horasExtrasAprovadas: r.horasExtrasAprovadas
          }))
        }
      }
    });

    res.status(201).json({
      message: 'Transferência para folha de pagamento criada com sucesso',
      transferencia: novaTransferencia
    });

  } catch (error) {
    console.error('Erro ao transferir para folha:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}
