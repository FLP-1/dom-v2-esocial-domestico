import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const conversas = await prisma.conversa.findMany({
        where: {
          ativa: true,
        },
        include: {
          participantes: {
            where: {
              ativo: true,
            },
            include: {
              usuario: {
                select: {
                  nomeCompleto: true,
                  apelido: true,
                },
              },
            },
          },
          mensagens: {
            include: {
              remetente: {
                select: {
                  nomeCompleto: true,
                  apelido: true,
                },
              },
              anexos: true,
              leituras: {
                include: {
                  usuario: {
                    select: {
                      nomeCompleto: true,
                    },
                  },
                },
              },
              reacoes: {
                include: {
                  usuario: {
                    select: {
                      nomeCompleto: true,
                    },
                  },
                },
              },
            },
            orderBy: {
              criadoEm: 'desc',
            },
            take: 50, // Últimas 50 mensagens por conversa
          },
        },
        orderBy: {
          ultimaMensagemEm: 'desc',
        },
      });

      const conversasFormatadas = conversas.map(conv => ({
        id: conv.id,
        type: conv.tipo,
        name: conv.nome,
        description: conv.descricao,
        avatar: conv.avatar,
        isActive: conv.ativa,
        isArchived: conv.arquivada,
        lastMessageAt: conv.ultimaMensagemEm?.toISOString(),
        participants: conv.participantes.map(p => ({
          userId: p.usuarioId,
          userName: p.usuario.apelido || p.usuario.nomeCompleto,
          role: p.papel,
          isPinned: p.fixada,
          isMuted: p.silenciada,
          notifications: p.notificacoes,
          lastRead: p.ultimaLeitura?.toISOString(),
        })),
        messages: conv.mensagens.map(m => ({
          id: m.id,
          content: m.conteudo,
          type: m.tipo,
          senderId: m.remetenteId,
          senderName: m.remetente.apelido || m.remetente.nomeCompleto,
          isRead: m.lida,
          isEdited: m.editada,
          isDeleted: m.excluida,
          isPinned: m.fixada,
          createdAt: m.criadoEm.toISOString(),
          replyToId: m.respostaParaId,
          attachments: m.anexos.map(a => ({
            id: a.id,
            name: a.nome,
            type: a.tipo,
            size: a.tamanho,
            url: a.url,
            thumbnail: a.thumbnail,
          })),
          readBy: m.leituras.map(l => ({
            userId: l.usuarioId,
            userName: l.usuario.nomeCompleto,
            readAt: l.lidaEm.toISOString(),
          })),
          reactions: m.reacoes.map(r => ({
            emoji: r.emoji,
            userId: r.usuarioId,
            userName: r.usuario.nomeCompleto,
          })),
        })),
      }));

      return res.status(200).json({ success: true, data: conversasFormatadas });
    } catch (error) {
      console.error('Erro ao buscar conversas:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar conversas' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

