// src/pages/api/time-clock/aprovar-hora-extra.ts
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Método não permitido' });
  }

  // Modelo de solicitação de hora extra não existe no schema atual.
  // Endpoint desativado temporariamente para manter a integridade do build.
  return res.status(501).json({ message: 'Aprovação de hora extra indisponível no momento.' });
}
