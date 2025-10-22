import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const termos = await prisma.termo.findMany({
        include: {
          aceites: {
            include: {
              usuario: {
                select: {
                  nomeCompleto: true,
                  apelido: true,
                  cpf: true,
                },
              },
            },
            orderBy: {
              aceitoEm: 'desc',
            },
          },
        },
        orderBy: {
          dataVigencia: 'desc',
        },
      });

      const termosFormatados = termos.map(termo => ({
        id: termo.id,
        version: termo.versao,
        type: termo.tipo,
        title: termo.titulo,
        subtitle: termo.subtitulo,
        content: termo.conteudo,
        isActive: termo.ativo,
        effectiveDate: termo.dataVigencia.toISOString().split('T')[0],
        expirationDate: termo.dataExpiracao?.toISOString().split('T')[0],
        changes: termo.mudancas,
        attachments: termo.anexos,
        notifications: {
          shouldNotify: termo.notificarUsuarios,
          notifiedAt: termo.notificadoEm?.toISOString(),
        },
        acceptances: termo.aceites.map(a => ({
          userId: a.usuarioId,
          userName: a.usuario.apelido || a.usuario.nomeCompleto,
          cpf: a.usuario.cpf,
          version: a.versao,
          acceptedAt: a.aceitoEm.toISOString(),
          ipAddress: a.enderecoIP,
          userAgent: a.userAgent,
          signatureHash: a.assinaturaHash,
        })),
        createdAt: termo.criadoEm.toISOString(),
        updatedAt: termo.atualizadoEm.toISOString(),
      }));

      return res.status(200).json({ success: true, data: termosFormatados });
    } catch (error) {
      console.error('Erro ao buscar termos:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar termos' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

