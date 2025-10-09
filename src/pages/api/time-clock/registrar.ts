// src/pages/api/time-clock/registrar.ts
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

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

    const registroExistente = await prisma.registroPonto.findFirst({
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
      const registroAnterior = await prisma.registroPonto.findFirst({
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
    const novoRegistro = await prisma.registroPonto.create({
      data: {
        usuarioId,
        dispositivoId: (await prisma.dispositivo.findFirst({ where: { usuarioId } }))?.id ||
          (await prisma.dispositivo.create({ data: { usuarioId, dispositivoId: `device_${Date.now()}_${usuarioId.substring(0,8)}`, tipo: 'DESKTOP', nome: 'Dispositivo Padrão' } })).id,
        dataHora: new Date(),
        tipo: tipo.toUpperCase(),
        latitude: typeof latitude === 'number' ? latitude : 0,
        longitude: typeof longitude === 'number' ? longitude : 0,
        precisao: 0,
        nomeRedeWiFi: nomeRedeWiFi || null,
        enderecoIP: enderecoIP || '0.0.0.0',
        aprovado: true,
        aprovadoPor: 'Sistema',
        aprovadoEm: new Date(),
        dentroGeofence: true,
        hashIntegridade: `hash_${Date.now()}`,
        observacao: observacaoFuncionario || null
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

    const registros = await prisma.registroPonto.findMany({
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
    // Sem modelos de horário/resumo no schema atual; nada a atualizar

  } catch (error) {
    console.error('Erro ao atualizar resumo de horas:', error);
  }
}
