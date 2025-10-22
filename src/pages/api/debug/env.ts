import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const hasDbUrl = !!process.env.DATABASE_URL
  const dbUrlPreview = process.env.DATABASE_URL 
    ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@')
    : 'NÃO DEFINIDA'

  res.status(200).json({
    hasDbUrl,
    dbUrlPreview,
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => k.includes('DATABASE'))
  })
}
