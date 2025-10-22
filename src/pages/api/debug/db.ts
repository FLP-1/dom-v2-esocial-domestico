import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    
    const userCount = await prisma.usuario.count()
    const configCount = await prisma.configuracaoSistema.count()

    res.status(200).json({
      success: true,
      userCount,
      configCount,
      message: 'Conexão com banco OK!'
    })
  } catch (error: any) {
    console.error('❌ Erro na API de debug:', error)
    res.status(500).json({
      success: false,
      error: error.message,
      stack: error.stack
    })
  }
}
