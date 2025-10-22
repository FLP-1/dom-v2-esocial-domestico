import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getPayroll(req, res);
      case 'POST':
        return await createPayroll(req, res);
      case 'PUT':
        return await updatePayroll(req, res);
      case 'DELETE':
        return await deletePayroll(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de folha de pagamento:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getPayroll(req: NextApiRequest, res: NextApiResponse) {
  const { usuarioId, mes, ano, status } = req.query;

  const where: any = {};
  if (usuarioId) where.usuarioId = usuarioId as string;
  if (mes) where.mes = parseInt(mes as string);
  if (ano) where.ano = parseInt(ano as string);
  if (status) where.status = status as string;

  const payroll = await prisma.folhaPagamento.findMany({
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
      { criadoEm: 'desc' },
    ],
  });

  return res.status(200).json({ success: true, data: payroll });
}

async function createPayroll(req: NextApiRequest, res: NextApiResponse) {
  const {
    usuarioId,
    empregadoId,
    mes,
    ano,
    salarioBase,
    horasTrabalhadas,
    horasExtras = 0,
    faltas = 0,
    atestados = 0,
    descontos = 0,
    adicionais = 0,
    salarioLiquido,
    status = 'PENDENTE',
    observacoes,
  } = req.body;

  if (!usuarioId || !empregadoId || !mes || !ano || !salarioBase || !horasTrabalhadas) {
    return res.status(400).json({
      success: false,
      error: 'Campos obrigatórios: usuarioId, empregadoId, mes, ano, salarioBase, horasTrabalhadas',
    });
  }

  const payroll = await prisma.folhaPagamento.create({
    data: {
      usuarioId,
      empregadoId,
      mes: parseInt(mes),
      ano: parseInt(ano),
      salarioBase: parseFloat(salarioBase),
      horasTrabalhadas: parseInt(horasTrabalhadas),
      horasExtras: parseInt(horasExtras),
      faltas: parseInt(faltas),
      atestados: parseInt(atestados),
      descontos: parseFloat(descontos),
      adicionais: parseFloat(adicionais),
      salarioLiquido: parseFloat(salarioLiquido || salarioBase),
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

  return res.status(201).json({ success: true, data: payroll });
}

async function updatePayroll(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const updateData = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  const payroll = await prisma.folhaPagamento.update({
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

  return res.status(200).json({ success: true, data: payroll });
}

async function deletePayroll(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  await prisma.folhaPagamento.delete({
    where: { id: id as string },
  });

  return res.status(200).json({ success: true, message: 'Folha de pagamento excluída com sucesso' });
}
