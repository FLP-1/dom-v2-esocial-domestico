import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { slug, tipoPagina, categoria, publica } = req.query;

      const whereClause: any = {};
      
      if (slug) whereClause.slug = slug;
      if (tipoPagina) whereClause.tipoPagina = tipoPagina;
      if (categoria) whereClause.categoria = categoria;
      if (publica !== undefined) whereClause.publica = publica === 'true';
      
      // Sempre filtrar apenas páginas ativas
      whereClause.ativa = true;

      const dadosPaginas = await prisma.dadosPagina.findMany({
        where: whereClause,
        orderBy: {
          ultimaModificacao: 'desc',
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: dadosPaginas 
      });
    } catch (error) {
      console.error('Erro ao buscar dados de páginas:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar dados de páginas' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        slug, 
        titulo, 
        conteudo, 
        tipoPagina, 
        categoria, 
        tags,
        publica,
        modificadoPor 
      } = req.body;
      
      if (!slug || !titulo || !conteudo || !tipoPagina || !categoria) {
        return res.status(400).json({
          success: false,
          error: 'slug, titulo, conteudo, tipoPagina e categoria são obrigatórios'
        });
      }

      const dadosPagina = await prisma.dadosPagina.create({
        data: {
          slug,
          titulo,
          conteudo,
          tipoPagina,
          categoria,
          tags: tags || [],
          publica: publica || false,
          modificadoPor,
          versao: '1.0',
        },
      });

      return res.status(201).json({ 
        success: true, 
        data: dadosPagina 
      });
    } catch (error) {
      console.error('Erro ao criar dados de página:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar dados de página' 
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { 
        id,
        slug, 
        titulo, 
        conteudo, 
        tipoPagina, 
        categoria, 
        tags,
        publica,
        ativa,
        modificadoPor,
        versao 
      } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id é obrigatório'
        });
      }

      const dadosPagina = await prisma.dadosPagina.update({
        where: { id },
        data: {
          slug,
          titulo,
          conteudo,
          tipoPagina,
          categoria,
          tags,
          publica,
          ativa,
          modificadoPor,
          versao,
          ultimaModificacao: new Date(),
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: dadosPagina 
      });
    } catch (error) {
      console.error('Erro ao atualizar dados de página:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao atualizar dados de página' 
      });
    }
  }

  if (req.method === 'DELETE') {
    try {
      const { id } = req.query;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id é obrigatório'
        });
      }

      // Soft delete - apenas desativar
      await prisma.dadosPagina.update({
        where: { id: id as string },
        data: {
          ativa: false,
          ultimaModificacao: new Date(),
        },
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Dados de página desativados com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao desativar dados de página:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao desativar dados de página' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
