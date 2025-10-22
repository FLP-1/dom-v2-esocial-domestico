// src/pages/api/debug/network-info.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { networkFingerprintingService } from '../../../services/antifraude/network-fingerprinting';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Este endpoint só pode ser chamado do cliente (não do servidor)
    res.status(400).json({
      success: false,
      error: 'Este endpoint deve ser chamado do cliente (browser), não do servidor',
      instructions: 'Use fetch() no browser para obter os dados de rede'
    });

    // Este endpoint retorna apenas instruções para uso do cliente
    // Os dados reais devem ser obtidos via fetch() no browser

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Erro ao capturar dados de rede'
    });
  }
}
