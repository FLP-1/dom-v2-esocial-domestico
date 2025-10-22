import prisma from '@/lib/prisma';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        return await getSystemConfig(req, res);
      case 'POST':
        return await createSystemConfig(req, res);
      case 'PUT':
        return await updateSystemConfig(req, res);
      case 'DELETE':
        return await deleteSystemConfig(req, res);
      default:
        return res.status(405).json({ success: false, error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de configuração do sistema:', error);
    return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
  } finally {
    await prisma.$disconnect();
  }
}

async function getSystemConfig(req: NextApiRequest, res: NextApiResponse) {
  const { chave, categoria } = req.query;

  const where: any = {};
  if (chave) {
    where.chave = chave;
  }
  if (categoria) {
    where.categoria = categoria;
  }

  const configs = await prisma.configuracaoSistema.findMany({
    where,
    orderBy: {
      categoria: 'asc',
    },
  });

  // Converter valores baseado no tipo
  const mappedConfigs = configs.map(config => {
    let valor: any = config.valor;
    
    switch (config.tipo) {
      case 'number':
        valor = parseFloat(config.valor);
        break;
      case 'boolean':
        valor = config.valor === 'true';
        break;
      case 'json':
        try {
          valor = JSON.parse(config.valor);
        } catch {
          valor = config.valor;
        }
        break;
      default:
        valor = config.valor;
    }

    return {
      id: config.id,
      chave: config.chave,
      valor,
      tipo: config.tipo,
      descricao: config.descricao,
      categoria: config.categoria,
      editavel: config.editavel,
      criadoEm: config.criadoEm,
      atualizadoEm: config.atualizadoEm,
    };
  });

  return res.status(200).json({ success: true, data: mappedConfigs });
}

async function createSystemConfig(req: NextApiRequest, res: NextApiResponse) {
  const { chave, valor, tipo, descricao, categoria, editavel } = req.body;

  if (!chave || valor === undefined || !tipo || !categoria) {
    return res.status(400).json({
      success: false,
      error: 'Chave, valor, tipo e categoria são obrigatórios',
    });
  }

  // Converter valor para string baseado no tipo
  let valorString: string;
  switch (tipo) {
    case 'number':
      valorString = valor.toString();
      break;
    case 'boolean':
      valorString = valor ? 'true' : 'false';
      break;
    case 'json':
      valorString = JSON.stringify(valor);
      break;
    default:
      valorString = valor.toString();
  }

  const config = await prisma.configuracaoSistema.create({
    data: {
      chave,
      valor: valorString,
      tipo,
      descricao,
      categoria,
      editavel: editavel !== undefined ? editavel : true,
    },
  });

  return res.status(201).json({ success: true, data: config });
}

async function updateSystemConfig(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const { valor, descricao, editavel } = req.body;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  // Buscar configuração existente para manter o tipo
  const existingConfig = await prisma.configuracaoSistema.findUnique({
    where: { id: id as string },
  });

  if (!existingConfig) {
    return res.status(404).json({ success: false, error: 'Configuração não encontrada' });
  }

  // Converter valor para string baseado no tipo existente
  let valorString: string | undefined;
  if (valor !== undefined) {
    switch (existingConfig.tipo) {
      case 'number':
        valorString = valor.toString();
        break;
      case 'boolean':
        valorString = valor ? 'true' : 'false';
        break;
      case 'json':
        valorString = JSON.stringify(valor);
        break;
      default:
        valorString = valor.toString();
    }
  }

  const updateData: any = {
    atualizadoEm: new Date(),
  };

  if (valorString !== undefined) {
    updateData.valor = valorString;
  }
  if (descricao !== undefined) {
    updateData.descricao = descricao;
  }
  if (editavel !== undefined) {
    updateData.editavel = editavel;
  }

  const config = await prisma.configuracaoSistema.update({
    where: { id: id as string },
    data: updateData,
  });

  return res.status(200).json({ success: true, data: config });
}

async function deleteSystemConfig(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ success: false, error: 'ID é obrigatório' });
  }

  await prisma.configuracaoSistema.delete({
    where: { id: id as string },
  });

  return res.status(200).json({ success: true, message: 'Configuração excluída com sucesso' });
}
