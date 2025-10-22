import type { NextApiRequest, NextApiResponse } from 'next'
import prisma from '@/lib/prisma'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const empregadores = await prisma.empregador.findMany({
        where: { ativo: true },
        orderBy: { criadoEm: 'desc' }
      })

      return res.status(200).json({
        success: true,
        data: empregadores,
        count: empregadores.length,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erro ao buscar empregadores:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro ao buscar empregadores',
        timestamp: new Date().toISOString()
      })
    }
  }

  if (req.method === 'POST') {
    try {
      const empregador = await prisma.empregador.create({
        data: req.body
      })

      return res.status(201).json({
        success: true,
        data: empregador,
        timestamp: new Date().toISOString()
      })
    } catch (error) {
      console.error('Erro ao criar empregador:', error)
      return res.status(500).json({
        success: false,
        error: 'Erro ao criar empregador',
        timestamp: new Date().toISOString()
      })
    }
  }

  return res.status(405).json({ error: 'Método não permitido' })
}

