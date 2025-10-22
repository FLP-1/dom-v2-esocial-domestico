import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getGroups(req, res);
      case 'POST':
        return await createGroup(req, res);
      case 'PUT':
        return await updateGroup(req, res);
      case 'DELETE':
        return await deleteGroup(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de grupos:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getGroups(req: NextApiRequest, res: NextApiResponse) {
  const { ativo } = req.query;

  const where: any = {};
  if (ativo !== undefined) {
    where.ativo = ativo === 'true';
  }

  const groups = await prisma.grupo.findMany({
    where,
    include: {
      _count: {
        select: {
          membros: true,
        },
      },
    },
    orderBy: {
      nome: 'asc',
    },
  });

  const mappedGroups = groups.map(group => ({
    id: group.id,
    nome: group.nome,
    descricao: group.descricao,
    cor: group.cor,
    icone: group.icone,
    totalMembros: group._count.membros,
    permissoes: [], // TODO: Implementar sistema de permissões
    ativo: group.ativo,
    criadoEm: group.criadoEm,
  }));

  return res.status(200).json({ success: true, data: mappedGroups });
}

async function createGroup(req: NextApiRequest, res: NextApiResponse) {
  const { nome, descricao, cor, icone } = req.body;

  if (!nome) {
    return res.status(400).json({
      success: false,
      error: 'Nome é obrigatório',
    });
  }

  const group = await prisma.grupo.create({
    data: {
      nome,
      descricao,
      cor: cor || '#3498db',
      icone: icone || '👥',
      tipo: 'GERAL',
      ativo: true,
    },
  });

  return res.status(201).json({ success: true, data: group });
}

async function updateGroup(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  const group = await prisma.grupo.update({
    where: { id: id as string },
    data: {
      ...updateData,
      atualizadoEm: new Date(),
    },
  });

  return res.status(200).json({ success: true, data: group });
}

async function deleteGroup(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  await prisma.grupo.delete({
    where: { id: id as string },
  });

  return res.status(200).json({ success: true, message: 'Grupo excluído com sucesso' });
}