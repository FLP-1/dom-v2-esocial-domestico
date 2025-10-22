import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const perfis = await prisma.perfil.findMany({
        where: {
          ativo: true,
        },
        include: {
          usuarios: {
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
          permissoes: {
            include: {
              funcionalidade: {
                select: {
                  codigo: true,
                  nome: true,
                  icone: true,
                  rota: true,
                },
              },
            },
          },
        },
        orderBy: {
          nome: 'asc',
        },
      });

      return res.status(200).json({ success: true, data: perfis });
    } catch (error) {
      console.error('Erro ao buscar perfis:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar perfis' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

