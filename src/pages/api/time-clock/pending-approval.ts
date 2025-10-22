import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/configService';
import { logger } from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar registros pendentes para aprovação
      const usuarioId = await getCurrentUserId();
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      }

      // ✅ Buscar TODOS os registros não aprovados (não apenas do usuário atual)
      // Para empregadores, mostrar registros de todos os funcionários
      // Para funcionários, mostrar apenas seus próprios registros
      
      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

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
            dataHora: { gte: inicioDia, lt: fimDia },
            grupoId: usuarioGrupo?.grupoId // ✅ Empregadores veem apenas registros do seu grupo
          }
        : {
            usuarioId,
            aprovado: false,
            dataHora: { gte: inicioDia, lt: fimDia },
            grupoId: usuarioGrupo?.grupoId // ✅ Funcionários veem apenas seus registros do seu grupo
          };

      const registrosPendentes = await prisma.registroPonto.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
            }
          }
        },
        orderBy: { dataHora: 'asc' }
      });

      res.status(200).json({
        success: true,
        data: registrosPendentes
      });

    } catch (error) {
      logger.error('Erro ao buscar registros pendentes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { registroId, acao, justificativa } = req.body;

      if (!registroId || !acao) {
        return res.status(400).json({
          success: false,
          error: 'ID do registro e ação são obrigatórios'
        });
      }

      if (!['aprovar', 'rejeitar'].includes(acao)) {
        return res.status(400).json({
          success: false,
          error: 'Ação deve ser "aprovar" ou "rejeitar"'
        });
      }

      const usuarioId = await getCurrentUserId();
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      }

      // Verificar se o registro existe e pertence ao usuário
      const registro = await prisma.registroPonto.findFirst({
        where: {
          id: registroId,
          usuarioId
        }
      });

      if (!registro) {
        return res.status(404).json({
          success: false,
          error: 'Registro não encontrado'
        });
      }

      // Atualizar o registro
      const registroAtualizado = await prisma.registroPonto.update({
        where: { id: registroId },
        data: {
          aprovado: acao === 'aprovar',
          aprovadoPor: acao === 'aprovar' ? 'Sistema' : 'Sistema',
          aprovadoEm: new Date(),
          observacao: justificativa 
            ? `${registro.observacao || ''} | ${acao === 'aprovar' ? 'APROVADO' : 'REJEITADO/INATIVO'}: ${justificativa}`.trim()
            : `${registro.observacao || ''} | ${acao === 'aprovar' ? 'APROVADO' : 'REJEITADO/INATIVO'} pelo sistema`.trim(),
          // ✅ Marcar como inativo se rejeitado (não será considerado para cálculos)
          ...(acao === 'rejeitar' && { 
            // Adicionar flag para indicar que foi rejeitado/inativo
            dataHora: registro.dataHora, // Manter data original
            tipo: `${registro.tipo}_REJEITADO`, // Marcar tipo como rejeitado
          })
        }
      });

      logger.log(`✅ Registro ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'}:`, {
        registroId,
        usuarioId,
        acao,
        justificativa
      });

      res.status(200).json({
        success: true,
        data: registroAtualizado,
        message: `Registro ${acao === 'aprovar' ? 'aprovado' : 'rejeitado'} com sucesso`
      });

    } catch (error) {
      logger.error('Erro ao processar aprovação:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }
}
