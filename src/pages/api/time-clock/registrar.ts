// src/pages/api/time-clock/registrar.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  try {
    const { 
      usuarioId, 
      tipo, 
      latitude, 
      longitude, 
      enderecoCompleto, 
      nomeRedeWiFi, 
      enderecoIP,
      observacaoFuncionario 
    } = req.body;

    if (!usuarioId || !tipo) {
      return res.status(400).json({ message: 'Usuário e tipo são obrigatórios' });
    }

    // Verificar se já existe registro do mesmo tipo hoje
    const hoje = new Date();
    const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

    const registroExistente = await prisma.registroPontoNovo.findFirst({
      where: {
        usuarioId,
        tipo,
        dataHora: {
          gte: inicioDia,
          lt: fimDia
        }
      }
    });

    if (registroExistente) {
      return res.status(400).json({ 
        message: `Já existe um registro de ${tipo} para hoje` 
      });
    }

    // Verificar sequência lógica (se necessário)
    const tiposSequencia = ['entrada', 'saida_almoco', 'retorno_almoco', 'saida'];
    const tipoIndex = tiposSequencia.indexOf(tipo);
    
    if (tipoIndex > 0) {
      const tipoAnterior = tiposSequencia[tipoIndex - 1];
      const registroAnterior = await prisma.registroPontoNovo.findFirst({
        where: {
          usuarioId,
          tipo: tipoAnterior,
          dataHora: {
            gte: inicioDia,
            lt: fimDia
          }
        }
      });

      if (!registroAnterior) {
        return res.status(400).json({ 
          message: `É necessário registrar ${tipoAnterior} primeiro` 
        });
      }
    }

    // Criar registro de ponto
    const novoRegistro = await prisma.registroPontoNovo.create({
      data: {
        usuarioId,
        tipo,
        latitude: latitude || null,
        longitude: longitude || null,
        enderecoCompleto: enderecoCompleto || null,
        nomeRedeWiFi: nomeRedeWiFi || null,
        enderecoIP: enderecoIP || null,
        observacaoFuncionario: observacaoFuncionario || null,
        aprovado: tipo === 'entrada' || tipo === 'saida', // Auto-aprovar entrada e saída
        aprovadoPor: tipo === 'entrada' || tipo === 'saida' ? 'Sistema' : null,
        aprovadoEm: tipo === 'entrada' || tipo === 'saida' ? new Date() : null,
      }
    });

    // Atualizar resumo de horas do dia
    await atualizarResumoHoras(usuarioId, hoje);

    res.status(201).json({
      message: 'Registro de ponto criado com sucesso',
      registro: novoRegistro
    });

  } catch (error) {
    console.error('Erro ao registrar ponto:', error);
    res.status(500).json({ message: 'Erro interno do servidor' });
  }
}

async function atualizarResumoHoras(usuarioId: string, data: Date) {
  try {
    // Buscar todos os registros do dia
    const inicioDia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
    const fimDia = new Date(data.getFullYear(), data.getMonth(), data.getDate() + 1);

    const registros = await prisma.registroPontoNovo.findMany({
      where: {
        usuarioId,
        dataHora: {
          gte: inicioDia,
          lt: fimDia
        }
      },
      orderBy: { dataHora: 'asc' }
    });

    // Calcular horas trabalhadas
    let horasTrabalhadas = 0;
    let entrada: Date | null = null;
    let saidaAlmoco: Date | null = null;
    let retornoAlmoco: Date | null = null;
    let saida: Date | null = null;

    registros.forEach(registro => {
      switch (registro.tipo) {
        case 'entrada':
          entrada = registro.dataHora;
          break;
        case 'saida_almoco':
          saidaAlmoco = registro.dataHora;
          break;
        case 'retorno_almoco':
          retornoAlmoco = registro.dataHora;
          break;
        case 'saida':
          saida = registro.dataHora;
          break;
      }
    });

    // Calcular horas trabalhadas
    if (entrada && saida) {
      const tempoTotal = saida.getTime() - entrada.getTime();
      const tempoAlmoco = (saidaAlmoco && retornoAlmoco) 
        ? retornoAlmoco.getTime() - saidaAlmoco.getTime()
        : 0;
      
      horasTrabalhadas = (tempoTotal - tempoAlmoco) / (1000 * 60 * 60); // Converter para horas
    }

    // Buscar horário oficial
    const diaSemana = data.getDay();
    const horarioOficial = await prisma.horarioOficial.findUnique({
      where: {
        usuarioId_diaSemana: {
          usuarioId,
          diaSemana
        }
      }
    });

    const horasOficiais = horarioOficial ? 8 : 0; // Assumir 8 horas por padrão

    // Upsert resumo
    await prisma.resumoHorasTrabalhadas.upsert({
      where: {
        usuarioId_dataReferencia_periodo: {
          usuarioId,
          dataReferencia: data,
          periodo: 'DIA'
        }
      },
      update: {
        horasTrabalhadas,
        horasOficiais,
        diferenca: horasTrabalhadas - horasOficiais,
        registrosPonto: registros.length,
        atualizadoEm: new Date()
      },
      create: {
        usuarioId,
        dataReferencia: data,
        periodo: 'DIA',
        horasTrabalhadas,
        horasOficiais,
        diferenca: horasTrabalhadas - horasOficiais,
        registrosPonto: registros.length,
        faltas: horasTrabalhadas === 0 ? 1 : 0,
        atrasos: 0 // TODO: Implementar lógica de atrasos
      }
    });

  } catch (error) {
    console.error('Erro ao atualizar resumo de horas:', error);
  }
}
