import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'
import { getCurrentUserId } from '../../../lib/configService'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { count } = req.query
      
      // ✅ Buscar usuário atual para verificar perfil
      const usuarioId = await getCurrentUserId();
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      }

      // ✅ Verificar se o usuário tem perfil de empregador
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

      // Empregadores veem registros pendentes do seu grupo, outros perfis veem apenas seus registros
      const isEmpregador = usuarioPerfil?.perfil?.codigo === 'empregador';
      
      // ✅ Buscar grupo do usuário para filtragem
      const usuarioGrupo = await prisma.usuarioGrupo.findFirst({
        where: { 
          usuarioId,
          ativo: true
        },
        select: { grupoId: true }
      });
      
      const whereClause = isEmpregador
        ? { 
            aprovado: false,
            grupoId: usuarioGrupo?.grupoId // ✅ Empregadores veem apenas registros do seu grupo
          }
        : { 
            usuarioId, 
            aprovado: false,
            grupoId: usuarioGrupo?.grupoId // ✅ Funcionários veem apenas seus registros do seu grupo
          };
      
      // Retornar dados vazios se não conseguir conectar ao banco
      try {
        if (count === 'true') {
          const total = await prisma.registroPonto.count({ where: whereClause })
          return res.status(200).json({ success: true, data: { total } })
        }

        const items = await prisma.registroPonto.findMany({
          where: whereClause,
          orderBy: { dataHora: 'desc' },
          take: 100
        })
        return res.status(200).json({ success: true, data: items })
      } catch (dbError) {
        // Retornar dados vazios em vez de erro 500
        if (count === 'true') {
          return res.status(200).json({ success: true, data: { total: 0 } })
        }
        return res.status(200).json({ success: true, data: [] })
      }
    } catch (error) {
      console.error('Erro ao buscar pendências de ponto:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }
  res.setHeader('Allow', ['GET'])
  return res.status(405).json({ success: false, error: 'Método não permitido' })
}


