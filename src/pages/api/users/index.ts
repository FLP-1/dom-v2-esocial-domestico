import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const usuarios = await prisma.usuario.findMany({
        select: {
          id: true,
          cpf: true,
          nomeCompleto: true,
          apelido: true,
          email: true,
          telefone: true,
          cidade: true,
          uf: true,
          perfis: {
            where: {
              ativo: true,
            },
            include: {
              perfil: {
                select: {
                  codigo: true,
                  nome: true,
                  cor: true,
                  icone: true,
                },
              },
            },
          },
        },
        orderBy: {
          nomeCompleto: 'asc',
        },
      });

      return res.status(200).json({ success: true, data: usuarios });
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar usuários' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

