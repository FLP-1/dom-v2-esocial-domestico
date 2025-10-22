import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const alertas = await prisma.alerta.findMany({
        include: {
          usuario: {
            select: {
              nomeCompleto: true,
              apelido: true,
            },
          },
          historico: {
            orderBy: {
              disparadoEm: 'desc',
            },
            take: 5,
          },
        },
        orderBy: {
          dataAlerta: 'desc',
        },
      });

      // Mapear para formato esperado pelo frontend
      const alertasFormatados = alertas.map(alerta => ({
        id: alerta.id,
        title: alerta.titulo,
        description: alerta.descricao,
        type: alerta.tipo,
        priority: alerta.prioridade.toLowerCase(),
        category: alerta.categoria,
        status: alerta.status.toLowerCase(),
        isRead: alerta.lido,
        date: alerta.dataAlerta.toISOString().split('T')[0],
        expirationDate: alerta.dataExpiracao?.toISOString().split('T')[0],
        isRecurring: alerta.recorrente,
        frequency: alerta.frequencia,
        notifyEmail: alerta.notificarEmail,
        notifyPush: alerta.notificarPush,
        notifySMS: alerta.notificarSMS,
        time: alerta.horaAlerta,
        conditions: alerta.condicoes,
        triggerCount: alerta.gatilhoContador,
        lastTrigger: alerta.ultimoGatilho?.toISOString(),
        history: alerta.historico.map(h => ({
          id: h.id,
          dispatchedAt: h.disparadoEm.toISOString(),
          recipients: h.destinatarios,
          channel: h.canal,
          success: h.sucesso,
          error: h.erro,
        })),
        userId: alerta.usuarioId,
        userName: alerta.usuario ? (alerta.usuario.apelido || alerta.usuario.nomeCompleto) : null,
      }));

      return res.status(200).json({ success: true, data: alertasFormatados });
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar alertas' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        titulo, 
        descricao, 
        tipo, 
        prioridade, 
        categoria,
        dataAlerta,
        usuarioId,
        notificarEmail,
        notificarPush,
      } = req.body;
      
      const novoAlerta = await prisma.alerta.create({
        data: {
          titulo,
          descricao,
          tipo,
          prioridade: prioridade.toUpperCase(),
          categoria,
          status: 'ATIVO',
          lido: false,
          dataAlerta: new Date(dataAlerta),
          usuarioId,
          notificarEmail: notificarEmail || false,
          notificarPush: notificarPush || true,
          notificarSMS: false,
          recorrente: false,
          gatilhoContador: 0,
        },
      });

      return res.status(201).json({ success: true, data: novoAlerta });
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar alerta' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

