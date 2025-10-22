/**
 * API de Validação Antifraude
 * POST /api/antifraude/validar
 * 
 * Recebe fingerprint, geolocalização e comportamento
 * Retorna análise de risco completa
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { analisarRisco, salvarAnaliseRisco } from '@/services/antifraude/risk-analyzer';
import { analisarIP } from '@/services/antifraude/ip-analyzer';

interface RequestBody {
  usuarioId?: string;
  fingerprintHash: string;
  fingerprintData: any;
  geolocalizacao?: {
    latitude: number;
    longitude: number;
    precisao?: number;
  };
  comportamento?: any;
  tipoEvento: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const {
      usuarioId,
      fingerprintHash,
      fingerprintData,
      geolocalizacao,
      comportamento,
      tipoEvento
    }: RequestBody = req.body;

    // Validar dados obrigatórios
    if (!fingerprintHash || !fingerprintData || !tipoEvento) {
      return res.status(400).json({
        error: 'Dados obrigatórios ausentes',
        required: ['fingerprintHash', 'fingerprintData', 'tipoEvento']
      });
    }

    // Obter IP do cliente
    const ipAddress = 
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
      (req.headers['x-real-ip'] as string) ||
      req.socket.remoteAddress ||
      '0.0.0.0';

    // Analisar IP em paralelo (não bloqueia a análise principal)
    analisarIP(ipAddress).catch(err => 
      console.error('Erro ao analisar IP:', err)
    );

    // Executar análise de risco
    const resultado = await analisarRisco({
      usuarioId,
      fingerprintHash,
      fingerprintData,
      ipAddress,
      geolocalizacao,
      comportamento,
      tipoEvento
    });

    // Salvar análise em background (não aguarda)
    salvarAnaliseRisco({
      usuarioId,
      fingerprintHash,
      fingerprintData,
      ipAddress,
      geolocalizacao,
      comportamento,
      tipoEvento
    }, resultado).catch(err => 
      console.error('Erro ao salvar análise:', err)
    );

    return res.status(200).json({
      success: true,
      risco: resultado.nivelRisco,
      score: resultado.scoreFinal,
      bloqueado: resultado.bloqueado,
      acao: resultado.acaoRecomendada,
      sinaisAlerta: resultado.sinaisAlerta,
      detalhes: {
        dispositivoNovo: resultado.dispositivoNovo,
        ipNovo: resultado.ipNovo,
        localizacaoNova: resultado.localizacaoNova,
        vpnDetectado: resultado.vpnDetectado,
        botDetectado: resultado.botDetectado
      }
    });
  } catch (error) {
    console.error('Erro na validação antifraude:', error);
    
    return res.status(500).json({
      error: 'Erro ao processar validação',
      message: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

