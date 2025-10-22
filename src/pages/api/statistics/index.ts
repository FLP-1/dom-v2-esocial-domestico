import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const statistics = await prisma.estatisticaSistema.findMany({
        orderBy: {
          categoria: 'asc',
        },
      });

      // Agrupar por categoria para facilitar o uso no frontend
      const groupedStats = statistics.reduce((acc, stat) => {
        if (!acc[stat.categoria]) {
          acc[stat.categoria] = [];
        }
        acc[stat.categoria].push({
          id: stat.id,
          chave: stat.chave,
          valor: stat.valor,
          descricao: stat.descricao,
          tipoDado: stat.tipoDado,
          atualizadaEm: stat.atualizadaEm,
        });
        return acc;
      }, {} as Record<string, any[]>);

      return res.status(200).json({ 
        success: true, 
        data: groupedStats,
        raw: statistics 
      });
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar estatísticas' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { chave, valor, descricao, categoria, tipoDado } = req.body;
      
      if (!chave || !valor || !categoria) {
        return res.status(400).json({
          success: false,
          error: 'chave, valor e categoria são obrigatórios'
        });
      }

      const estatistica = await prisma.estatisticaSistema.upsert({
        where: { chave },
        update: {
          valor,
          descricao,
          categoria,
          tipoDado,
          atualizadaEm: new Date(),
        },
        create: {
          chave,
          valor,
          descricao,
          categoria,
          tipoDado: tipoDado || 'texto',
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: estatistica 
      });
    } catch (error) {
      console.error('Erro ao criar/atualizar estatística:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao processar estatística' 
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { chave, valor } = req.body;
      
      if (!chave || !valor) {
        return res.status(400).json({
          success: false,
          error: 'chave e valor são obrigatórios'
        });
      }

      const estatistica = await prisma.estatisticaSistema.update({
        where: { chave },
        data: {
          valor,
          atualizadaEm: new Date(),
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: estatistica 
      });
    } catch (error) {
      console.error('Erro ao atualizar estatística:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao atualizar estatística' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
