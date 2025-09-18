// Teste simples de inicialização
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Simular inicialização
    const soapService = {
      isRealMode: false,
      isInitialized: false,
      initialize: async function () {
        console.log('🔧 Inicializando serviço SOAP...');
        this.isInitialized = true;
        this.isRealMode = true;
        console.log('✅ Serviço SOAP inicializado');
        console.log(`🔧 Modo Real: ${this.isRealMode}`);
      },
      isRealModeEnabled: function () {
        return this.isRealMode;
      },
    };

    await soapService.initialize();

    return res.status(200).json({
      success: true,
      isRealMode: soapService.isRealModeEnabled(),
      isInitialized: soapService.isInitialized,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}
