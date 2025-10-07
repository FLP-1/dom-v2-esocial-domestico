import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUserId, validateUser } from '../../../lib/configService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar registros de ponto do usuário atual (por enquanto, todos)
      const records = await prisma.registroPontoNovo.findMany({
        orderBy: {
          dataHora: 'desc'
        },
        take: 50
      });

      res.status(200).json({
        success: true,
        data: records
      });
    } catch (error) {
      console.error('Erro ao buscar registros:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { 
        tipo, 
        observacao, 
        latitude, 
        longitude, 
        precisao, 
        endereco, 
        wifiName,
        connectionType,
        effectiveType,
        downlink,
        rtt,
        userAgent,
        networkTimestamp
      } = req.body;

      console.log('📝 Dados completos recebidos para registro:', {
        tipo,
        latitude,
        longitude,
        precisao,
        endereco,
        wifiName,
        connectionType,
        effectiveType,
        downlink,
        rtt,
        userAgent,
        networkTimestamp
      });

      // Criar novo registro de ponto com dados reais de localização
      const newRecord = await prisma.registroPontoNovo.create({
        data: {
          usuarioId: await getCurrentUserId(), // Usuário dinâmico do sistema
          dataHora: new Date(),
          tipo: tipo || 'entrada',
          observacaoFuncionario: observacao || '',
          // Dados de localização em tempo real
          latitude: latitude || null,
          longitude: longitude || null,
          precisao: precisao || null,
          enderecoCompleto: endereco || 'Localização não disponível',
          // Informações detalhadas da rede WiFi
          nomeRedeWiFi: wifiName || 'WiFi não detectado',
          enderecoIP: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'IP não detectado',
          userAgent: userAgent || req.headers['user-agent'] || '',
          aprovado: true, // Por enquanto, auto-aprovar
          aprovadoPor: 'Sistema',
          aprovadoEm: new Date(),
          dentroGeofence: true
        }
      });

      res.status(201).json({
        success: true,
        data: newRecord
      });
    } catch (error) {
      console.error('Erro ao criar registro:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }
}
