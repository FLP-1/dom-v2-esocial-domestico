import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getTaxGuides(req, res);
      case 'POST':
        return await createTaxGuide(req, res);
      case 'PUT':
        return await updateTaxGuide(req, res);
      case 'DELETE':
        return await deleteTaxGuide(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de guias de impostos:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getTaxGuides(req: NextApiRequest, res: NextApiResponse) {
  const { usuarioId, tipo, mes, ano, status } = req.query;

  const where: any = {};
  if (usuarioId) where.usuarioId = usuarioId as string;
  if (tipo) where.tipo = tipo as string;
  if (mes) where.mes = parseInt(mes as string);
  if (ano) where.ano = parseInt(ano as string);
  if (status) where.status = status as string;

  const taxGuides = await prisma.guiaImposto.findMany({
    where,
    include: {
      usuario: {
        select: {
          id: true,
          nomeCompleto: true,
          cpf: true,
          email: true,
        },
      },
    },
    orderBy: [
      { ano: 'desc' },
      { mes: 'desc' },
      { vencimento: 'asc' },
    ],
  });

  return res.status(200).json({ success: true, data: taxGuides });
}

async function createTaxGuide(req: NextApiRequest, res: NextApiResponse) {
  const {
    usuarioId,
    tipo,
    mes,
    ano,
    valor,
    vencimento,
    status = 'PENDENTE',
    observacoes,
  } = req.body;

  if (!usuarioId || !tipo || !mes || !ano || !valor || !vencimento) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: usuarioId, tipo, mes, ano, valor, vencimento',
    });
  }

  const taxGuide = await prisma.guiaImposto.create({
    data: {
      usuarioId,
      tipo,
      mes: parseInt(mes),
      ano: parseInt(ano),
      valor: parseFloat(valor),
      vencimento: new Date(vencimento),
      status,
      observacoes,
    },
    include: {
      usuario: {
        select: {
          id: true,
          nomeCompleto: true,
          cpf: true,
          email: true,
        },
      },
    },
  });

  return res.status(201).json({ success: true, data: taxGuide });
}

async function updateTaxGuide(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  const taxGuide = await prisma.guiaImposto.update({
    where: { id: id as string },
    data: {
      ...updateData,
      atualizadoEm: new Date(),
    },
    include: {
      usuario: {
        select: {
          id: true,
          nomeCompleto: true,
          cpf: true,
          email: true,
        },
      },
    },
  });

  return res.status(200).json({ success: true, data: taxGuide });
}

async function deleteTaxGuide(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  await prisma.guiaImposto.delete({
    where: { id: id as string },
  });

  return res.status(200).json({ success: true, message: 'Guia de imposto excluído com sucesso' });
}
