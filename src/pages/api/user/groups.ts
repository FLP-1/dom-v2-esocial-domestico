import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const usuarioId = await getCurrentUserId();
    if (!usuarioId) {
      return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
    }

    // ✅ Buscar grupos do usuário
    const usuarioGrupos = await prisma.usuarioGrupo.findMany({
      where: { 
        usuarioId,
        ativo: true
      },
      include: {
        grupo: {
          select: {
            id: true,
            nome: true,
            descricao: true,
            cor: true,
            icone: true
          }
        }
      },
      orderBy: { criadoEm: 'asc' }
    });

    // ✅ Buscar perfil principal do usuário
    const usuarioPerfil = await prisma.usuarioPerfil.findFirst({
      where: { 
        usuarioId,
        ativo: true,
        principal: true
      },
      include: {
        perfil: {
          select: { codigo: true, nome: true }
        }
      }
    });

    const response = {
      success: true,
      data: {
        grupos: usuarioGrupos.map(ug => ({
          id: ug.grupo.id,
          nome: ug.grupo.nome,
          descricao: ug.grupo.descricao,
          cor: ug.grupo.cor,
          icone: ug.grupo.icone,
          ativo: ug.ativo,
        })),
        perfilPrincipal: usuarioPerfil ? {
          codigo: usuarioPerfil.perfil.codigo,
          nome: usuarioPerfil.perfil.nome,
          avatar: usuarioPerfil.avatar,
          apelido: usuarioPerfil.apelido
        } : null
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Erro ao buscar grupos do usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}
