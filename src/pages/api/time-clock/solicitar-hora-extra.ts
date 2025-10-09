// src/pages/api/time-clock/solicitar-hora-extra.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Modelo de solicitação de hora extra não existe no schema atual.
  return res.status(501).json({ message: 'Solicitação de hora extra indisponível no momento.' });
}
