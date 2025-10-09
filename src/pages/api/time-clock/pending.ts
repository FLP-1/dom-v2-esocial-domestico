import { NextApiRequest, NextApiResponse } from 'next'
import prisma from '../../../lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { count } = req.query
      if (count === 'true') {
        const total = await prisma.registroPonto.count({ where: { aprovado: false } })
        return res.status(200).json({ success: true, data: { total } })
      }

      const items = await prisma.registroPonto.findMany({
        where: { aprovado: false },
        orderBy: { dataHora: 'desc' },
        take: 100
      })
      return res.status(200).json({ success: true, data: items })
    } catch (error) {
      console.error('Erro ao buscar pendências de ponto:', error)
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' })
    }
  }
  res.setHeader('Allow', ['GET'])
  return res.status(405).json({ success: false, error: 'Método não permitido' })
}


