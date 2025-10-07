import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUser } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const currentUser = await getCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Token de autenticação necessário' });
      }

      const user = await prisma.usuario.findUnique({
        where: { id: currentUser.userId },
        include: {
          perfis: {
            include: {
              perfil: true
            }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
      }

      // Buscar horários oficiais do usuário
      const horariosOficiais = await prisma.horarioOficial.findMany({
        where: {
          usuarioId: user.id
        }
      });

      // Buscar dados de folha de pagamento
      const folhaPagamento = await prisma.folhaPagamento.findFirst({
        where: {
          usuarioId: user.id
        },
        orderBy: {
          criadoEm: 'desc'
        }
      });

      // Buscar documentos recentes
      const documentosRecentes = await prisma.documento.findMany({
        where: {
          usuarioId: user.id
        },
        orderBy: {
          criadoEm: 'desc'
        },
        take: 5
      });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            nomeCompleto: user.nomeCompleto,
            apelido: user.apelido,
            email: user.email,
            avatar: user.perfis.find(p => p.principal)?.avatar || user.apelido?.substring(0, 2).toUpperCase() || 'U',
            role: user.perfis.find(p => p.principal)?.perfil?.nome || 'Usuário'
          },
          horariosOficiais,
          folhaPagamento,
          documentosRecentes
        }
      });
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }
}
