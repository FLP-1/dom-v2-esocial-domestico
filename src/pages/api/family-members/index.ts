import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const { usuarioId } = req.query;

      const whereClause = usuarioId 
        ? { usuarioId: usuarioId as string }
        : {};

      const membros = await prisma.membroFamilia.findMany({
        where: whereClause,
        include: {
          usuario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
            },
          },
        },
        orderBy: {
          criadoEm: 'desc',
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: membros 
      });
    } catch (error) {
      console.error('Erro ao buscar membros da família:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar membros da família' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        usuarioId, 
        nome, 
        parentesco, 
        cpf, 
        dataNascimento, 
        telefone, 
        email, 
        endereco,
        contatoEmergencia,
        responsavelFinanceiro 
      } = req.body;
      
      if (!usuarioId || !nome || !parentesco) {
        return res.status(400).json({
          success: false,
          error: 'usuarioId, nome e parentesco são obrigatórios'
        });
      }

      const membro = await prisma.membroFamilia.create({
        data: {
          usuarioId,
          nome,
          parentesco,
          cpf,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : null,
          telefone,
          email,
          endereco: endereco || {},
          contatoEmergencia: contatoEmergencia || false,
          responsavelFinanceiro: responsavelFinanceiro || false,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
            },
          },
        },
      });

      return res.status(201).json({ 
        success: true, 
        data: membro 
      });
    } catch (error) {
      console.error('Erro ao criar membro da família:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar membro da família' 
      });
    }
  }

  if (req.method === 'PUT') {
    try {
      const { 
        id, 
        nome, 
        parentesco, 
        cpf, 
        dataNascimento, 
        telefone, 
        email, 
        endereco,
        contatoEmergencia,
        responsavelFinanceiro,
        ativo 
      } = req.body;
      
      if (!id) {
        return res.status(400).json({
          success: false,
          error: 'id é obrigatório'
        });
      }

      const membro = await prisma.membroFamilia.update({
        where: { id },
        data: {
          nome,
          parentesco,
          cpf,
          dataNascimento: dataNascimento ? new Date(dataNascimento) : undefined,
          telefone,
          email,
          endereco,
          contatoEmergencia,
          responsavelFinanceiro,
          ativo,
        },
        include: {
          usuario: {
            select: {
              id: true,
              nomeCompleto: true,
              email: true,
            },
          },
        },
      });

      return res.status(200).json({ 
        success: true, 
        data: membro 
      });
    } catch (error) {
      console.error('Erro ao atualizar membro da família:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao atualizar membro da família' 
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

      await prisma.membroFamilia.delete({
        where: { id: id as string },
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Membro da família removido com sucesso' 
      });
    } catch (error) {
      console.error('Erro ao remover membro da família:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao remover membro da família' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
