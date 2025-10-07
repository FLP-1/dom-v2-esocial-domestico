import { NextApiRequest, NextApiResponse } from 'next';
import configService from '../../../lib/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { chave } = req.query;
      
      if (chave) {
        // Obter configuração específica
        const valor = await configService.getConfig(chave as string);
        res.status(200).json({
          success: true,
          chave: chave as string,
          valor
        });
      } else {
        // Obter todas as configurações
        const empresaConfig = await configService.getEmpresaConfig();
        const baseUrl = await configService.getBaseUrl();
        const geocodingPrecision = await configService.getGeocodingPrecision();
        const sessionTimeout = await configService.getSessionTimeout();
        const esocialEnv = await configService.getESocialEnvironment();
        
        res.status(200).json({
          success: true,
          data: {
            empresa: empresaConfig,
            sistema: {
              urlBase: baseUrl,
              geocodingPrecision,
              sessionTimeout,
              esocialEnvironment: esocialEnv
            }
          }
        });
      }
    } catch (error) {
      console.error('Erro ao obter configurações:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { chave, valor, categoria, tipo, empresaId } = req.body;
      
      if (!chave || !valor) {
        return res.status(400).json({
          success: false,
          error: 'Chave e valor são obrigatórios'
        });
      }
      
      await configService.setConfig(chave, valor, categoria, tipo, empresaId);
      
      res.status(200).json({
        success: true,
        message: 'Configuração atualizada com sucesso'
      });
    } catch (error) {
      console.error('Erro ao atualizar configuração:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
