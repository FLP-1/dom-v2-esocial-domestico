import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // console.log('DATABASE_URL:', process.env.DATABASE_URL)
    
    // Teste simples de conexão
    const result = await prisma.$queryRaw`SELECT 1 as test`
    
    return res.status(200).json({
      success: true,
      message: 'Conexão com banco funcionando',
      databaseUrl: process.env.DATABASE_URL ? 'Definida' : 'Não definida',
      result
    })
  } catch (error) {
    console.error('Erro na conexão:', error)
    
    return res.status(500).json({
      success: false,
      error: error.message,
      databaseUrl: process.env.DATABASE_URL ? 'Definida' : 'Não definida'
    })
  }
}


