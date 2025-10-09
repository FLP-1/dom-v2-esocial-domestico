import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/configService';
import configService from '../../../lib/configService';
import { logger } from '../../../utils/logger';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar registros de ponto do usuário atual (por enquanto, todos)
      const records = await prisma.registroPonto.findMany({
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
      const allowedTypes = new Set([
        'entrada',
        'saida_almoco',
        'retorno_almoco',
        'saida',
        'inicio_extra',
        'fim_extra',
      ]);

      const body = req.body || {};
      const {
        tipo,
        observacao,
        latitude,
        longitude,
        precisao,
        wifiName,
        overrideJustification
      } = body;

      logger.log('📝 Dados completos recebidos para registro:', {
        tipo,
        latitude,
        longitude,
        precisao,
        wifiName,
      });

      // Autenticação/identificação do usuário
      const usuarioId = await getCurrentUserId();
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      }

      // Validações básicas de entrada
      if (!tipo || typeof tipo !== 'string' || !allowedTypes.has(tipo)) {
        return res.status(400).json({ success: false, error: 'Tipo de registro inválido' });
      }
      if (typeof latitude !== 'number' || typeof longitude !== 'number') {
        return res.status(400).json({ success: false, error: 'Localização inválida (latitude/longitude obrigatórias)' });
      }
      const precise = typeof precisao === 'number' ? precisao : null;

      // Regras dinâmicas (DB)
      const maxAccuracy = await configService.getGeolocationMaxAccuracy();
      const maxAgeSec = await configService.getGeolocationMaxAgeSeconds();
      const overrideRoles = await configService.getPunchOverrideRoles();

      // Garantir dispositivo (idempotente)
      let dispositivo = await prisma.dispositivo.findFirst({ where: { usuarioId } });
      if (!dispositivo) {
        dispositivo = await prisma.dispositivo.create({
          data: {
            usuarioId,
            dispositivoId: `device_${Date.now()}_${usuarioId.substring(0, 8)}`,
            tipo: 'DESKTOP',
            nome: 'Dispositivo Padrão',
          },
        });
      }

      const hoje = new Date();
      const inicioDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimDia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);

      // Prevenir duplicidade do mesmo tipo no dia
      const existenteMesmoTipo = await prisma.registroPonto.findFirst({
        where: {
          usuarioId,
          tipo,
          dataHora: { gte: inicioDia, lt: fimDia },
        },
      });
      if (existenteMesmoTipo) {
        return res.status(409).json({ success: false, error: `Já existe um registro de ${tipo} para hoje` });
      }

      // Validar sequência lógica básica (sem horas extras)
      const sequencia = ['entrada', 'saida_almoco', 'retorno_almoco', 'saida'] as const;
      if (sequencia.includes(tipo as any)) {
        const idx = sequencia.indexOf(tipo as any);
        if (idx > 0) {
          const tipoAnterior = sequencia[idx - 1];
          const temAnterior = await prisma.registroPonto.findFirst({
            where: {
              usuarioId,
              tipo: tipoAnterior,
              dataHora: { gte: inicioDia, lt: fimDia },
            },
          });
          if (!temAnterior) {
            return res.status(422).json({ success: false, error: `É necessário registrar ${tipoAnterior} primeiro` });
          }
        }
      }

      const ipAddress = (req.headers['x-forwarded-for'] as string) || (req.socket as any)?.remoteAddress || '';
      const hashIntegridade = crypto
        .createHash('sha256')
        .update(`${usuarioId}|${Date.now()}|${latitude}|${longitude}|${ipAddress}`)
        .digest('hex');

      // Validar precisão e idade (quando timestamp vier do cliente, opcional)
      const now = Date.now();
      const clientTs = typeof body.networkTimestamp === 'string' ? Date.parse(body.networkTimestamp) : null;
      const ageSec = clientTs ? Math.max(0, Math.floor((now - clientTs) / 1000)) : 0;

      const accuracyOk = typeof precisao === 'number' ? precisao <= maxAccuracy : false;
      const ageOk = clientTs ? ageSec <= maxAgeSec : true; // se não veio timestamp, considerar ok

      // Verificar override
      let aprovado = true;
      let aprovadoPor: string | undefined = 'Sistema';
      let aprovadoEm: Date | undefined = new Date();
      let dentroGeofence = true; // placeholder para futura verificação de perímetro

      if (!accuracyOk || !ageOk) {
        // Checar se override permitido
        const canOverride = overrideJustification && overrideRoles.length > 0; // regra adicional de papel poderia vir do token
        if (!canOverride) {
          const reason = !accuracyOk ? `Precisão insuficiente (>${maxAccuracy}m)` : `Localização antiga (> ${maxAgeSec}s)`;
          return res.status(422).json({ success: false, error: reason });
        }
        aprovado = false;
        aprovadoPor = undefined;
        aprovadoEm = undefined;
        dentroGeofence = false;
      }

      const created = await prisma.registroPonto.create({
        data: {
          usuarioId,
          dispositivoId: dispositivo.id,
          dataHora: new Date(),
          tipo,
          observacao: overrideJustification ? `OVERRIDE: ${overrideJustification}${observacao ? ' | ' + observacao : ''}` : (observacao || undefined),
          latitude,
          longitude,
          precisao: precise ?? 0,
          nomeRedeWiFi: wifiName ?? null,
          enderecoIP: ipAddress || '0.0.0.0',
          aprovado,
          aprovadoPor,
          aprovadoEm,
          dentroGeofence,
          hashIntegridade,
        },
      });

      return res.status(201).json({ success: true, data: created });
    } catch (err: any) {
      logger.error('Erro ao criar registro:', err);
      return res.status(500).json({ success: false, error: 'Erro interno do servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }
}
