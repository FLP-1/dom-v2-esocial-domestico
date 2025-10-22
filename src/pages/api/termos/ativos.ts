import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

/**
 * API para buscar termos e políticas ativos do banco
 * Substitui dados hardcoded por dados dinâmicos
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Buscar termos de uso ativos
    const termosUso = await prisma.termo.findFirst({
      where: {
        tipo: 'termos_uso',
        ativo: true
      },
      orderBy: {
        dataVigencia: 'desc'
      }
    });

    // Buscar política de privacidade ativa
    const politicaPrivacidade = await prisma.termo.findFirst({
      where: {
        tipo: 'politica_privacidade',
        ativo: true
      },
      orderBy: {
        dataVigencia: 'desc'
      }
    });

    // Se não existirem termos no banco, retornar erro
    if (!termosUso || !politicaPrivacidade) {
      return res.status(404).json({
        error: 'Termos não configurados no sistema',
        message: 'Execute o seed de configurações primeiro'
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        termosUso: {
          id: termosUso.id,
          versao: termosUso.versao,
          titulo: termosUso.titulo,
          conteudo: termosUso.conteudo,
          dataVigencia: termosUso.dataVigencia
        },
        politicaPrivacidade: {
          id: politicaPrivacidade.id,
          versao: politicaPrivacidade.versao,
          titulo: politicaPrivacidade.titulo,
          conteudo: politicaPrivacidade.conteudo,
          dataVigencia: politicaPrivacidade.dataVigencia
        }
      }
    });

  } catch (error) {
    console.error('Erro ao buscar termos:', error);
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: 'Falha ao buscar termos do banco de dados'
    });
  }
}
