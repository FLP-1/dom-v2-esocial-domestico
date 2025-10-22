// src/pages/api/antifraude/network-analysis.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { networkFingerprintingService, NetworkFingerprint } from '../../../services/antifraude/network-fingerprinting';
import prisma from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/configService';
import { logger } from '../../../utils/logger';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const userId = await getCurrentUserId();
    if (!userId) {
      return res.status(401).json({ error: 'Usuário não autenticado' });
    }

    const { fingerprint }: { fingerprint: NetworkFingerprint } = req.body;

    if (!fingerprint) {
      return res.status(400).json({ error: 'Fingerprint de rede é obrigatório' });
    }

    // Buscar dados históricos do usuário
    const historicalFingerprints = await prisma.networkFingerprint.findMany({
      where: { usuarioId: userId },
      orderBy: { timestamp: 'desc' },
      take: 10
    });

    // Converter para formato esperado
    const historicalData: NetworkFingerprint[] = historicalFingerprints.map(h => ({
      connectionType: h.connectionType,
      effectiveType: h.effectiveType,
      downlink: h.downlink,
      rtt: h.rtt,
      ipAddress: h.ipAddress,
      timezone: h.timezone,
      language: h.language,
      userAgent: h.userAgent,
      platform: h.platform,
      screenResolution: h.screenResolution,
      networkFingerprint: {
        connectionSpeed: h.connectionSpeed,
        connectionQuality: h.connectionQuality,
        networkLatency: h.networkLatency,
        bandwidthEstimate: h.bandwidthEstimate
      },
      timestamp: h.timestamp.toISOString(),
      sessionId: h.sessionId
    }));

    // Realizar análise de rede
    const analysis = await networkFingerprintingService.analyzeNetwork(fingerprint, historicalData);

    // Detectar possíveis fraudes
    const fraudDetection = networkFingerprintingService.detectNetworkFraud(fingerprint, historicalData);

    // Salvar fingerprint atual no banco
    await prisma.networkFingerprint.create({
      data: {
        usuarioId: userId,
        connectionType: fingerprint.connectionType,
        effectiveType: fingerprint.effectiveType,
        downlink: fingerprint.downlink,
        rtt: fingerprint.rtt,
        ipAddress: fingerprint.ipAddress,
        timezone: fingerprint.timezone,
        language: fingerprint.language,
        userAgent: fingerprint.userAgent,
        platform: fingerprint.platform,
        screenResolution: fingerprint.screenResolution,
        connectionSpeed: fingerprint.networkFingerprint.connectionSpeed,
        connectionQuality: fingerprint.networkFingerprint.connectionQuality,
        networkLatency: fingerprint.networkFingerprint.networkLatency,
        bandwidthEstimate: fingerprint.networkFingerprint.bandwidthEstimate,
        timestamp: new Date(fingerprint.timestamp),
        sessionId: fingerprint.sessionId,
        riskScore: analysis.riskScore,
        confidence: analysis.confidence,
        anomalies: JSON.stringify(analysis.anomalies),
        isFraud: fraudDetection.isFraud,
        fraudReasons: JSON.stringify(fraudDetection.reasons),
        fraudConfidence: fraudDetection.confidence
      }
    });

    // Log da análise
    logger.log('🔍 Análise de rede antifraude concluída:', {
      userId,
      riskScore: analysis.riskScore,
      confidence: analysis.confidence,
      isFraud: fraudDetection.isFraud,
      fraudConfidence: fraudDetection.confidence,
      anomalies: analysis.anomalies.length,
      reasons: fraudDetection.reasons.length
    });

    // Retornar resultado da análise
    res.status(200).json({
      success: true,
      analysis: {
        riskScore: analysis.riskScore,
        confidence: analysis.confidence,
        anomalies: analysis.anomalies,
        networkProfile: analysis.networkProfile,
        fraudDetection: {
          isFraud: fraudDetection.isFraud,
          reasons: fraudDetection.reasons,
          confidence: fraudDetection.confidence
        },
        recommendations: generateRecommendations(analysis, fraudDetection)
      }
    });

  } catch (error) {
    logger.log('❌ Erro na análise de rede antifraude:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

function generateRecommendations(analysis: any, fraudDetection: any): string[] {
  const recommendations: string[] = [];

  if (analysis.riskScore > 70) {
    recommendations.push('Alto risco detectado - requer verificação adicional');
  }

  if (analysis.confidence < 50) {
    recommendations.push('Baixa confiança na análise - coletar mais dados');
  }

  if (fraudDetection.isFraud) {
    recommendations.push('Possível fraude detectada - bloquear temporariamente');
  }

  if (analysis.anomalies.length > 3) {
    recommendations.push('Múltiplas anomalias detectadas - investigar');
  }

  if (analysis.networkProfile.type === 'unknown') {
    recommendations.push('Tipo de rede não identificado - solicitar informações adicionais');
  }

  return recommendations;
}
