import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUserId } from '../../../lib/configService';
import configService from '../../../lib/configService';
import { logger } from '../../../utils/logger';
import timeClockNotificationService from '../../../services/timeClockNotificationService';
import crypto from 'crypto';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Buscar registros de ponto do usuário atual
      let usuarioId;
      try {
        usuarioId = await getCurrentUserId();
      } catch (error) {
        return res.status(200).json({ success: true, data: [] });
      }
      
      if (!usuarioId) {
        return res.status(200).json({ success: true, data: [] });
      }

      const { grupoId, usuarioPerfilId } = req.query as { grupoId?: string; usuarioPerfilId?: string };

      try {
        const records = await prisma.registroPonto.findMany({
          where: {
            usuarioId,
            ...(grupoId ? { grupoId } : {}),
            ...(usuarioPerfilId ? { usuarioPerfilId } : {}),
          },
          orderBy: { dataHora: 'desc' },
          take: 50
        });

        res.status(200).json({
          success: true,
          data: records
        });
      } catch (dbError) {
        res.status(200).json({ success: true, data: [] });
      }
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
        endereco,
        numeroEndereco,
        wifiName,
        overrideJustification,
        grupoId,
        usuarioPerfilId,
        clientIP,
        networkFingerprint,
        riskAnalysis
      } = body;

      logger.log('📝 Dados completos recebidos para registro:', {
        tipo,
        latitude,
        longitude,
        precisao,
        endereco,
        numeroEndereco,
        wifiName,
        grupoId,
        usuarioPerfilId,
        clientIP,
        body: JSON.stringify(body, null, 2)
      });

      // Autenticação/identificação do usuário
      const usuarioId = await getCurrentUserId();
      if (!usuarioId) {
        return res.status(401).json({ success: false, error: 'Usuário não autenticado' });
      }

      // ✅ Buscar automaticamente grupoId e usuarioPerfilId do usuário
      let usuarioGrupoId = grupoId;
      let usuarioPerfilIdFinal = usuarioPerfilId;
      
      if (!usuarioGrupoId || !usuarioPerfilIdFinal) {
        try {
          // Buscar dados do usuário no banco
          const usuario = await prisma.usuario.findUnique({
            where: { id: usuarioId },
            include: {
              gruposUsuario: {
                include: {
                  grupo: true
                }
              },
              perfis: {
                where: {
                  ativo: true
                }
              }
            }
          });

          if (!usuario) {
            return res.status(404).json({ success: false, error: 'Usuário não encontrado' });
          }

          // Buscar grupo ativo do usuário
          if (!usuarioGrupoId && usuario.gruposUsuario.length > 0) {
            const grupoAtivo = usuario.gruposUsuario.find(ug => ug.ativo) || usuario.gruposUsuario[0];
            usuarioGrupoId = grupoAtivo.grupoId;
          }

          // Buscar perfil ativo do usuário
          if (!usuarioPerfilIdFinal && usuario.perfis.length > 0) {
            const perfilAtivo = usuario.perfis.find(up => up.ativo) || usuario.perfis[0];
            usuarioPerfilIdFinal = perfilAtivo.id;
          }

          // Validar se encontrou os dados obrigatórios
          if (!usuarioGrupoId) {
            return res.status(400).json({ success: false, error: 'Usuário não está associado a nenhum grupo' });
          }
          if (!usuarioPerfilIdFinal) {
            return res.status(400).json({ success: false, error: 'Usuário não possui perfil ativo' });
          }

          logger.log('✅ Dados do usuário encontrados automaticamente:', {
            usuarioId,
            usuarioGrupoId,
            usuarioPerfilIdFinal
          });

        } catch (error) {
          logger.error('Erro ao buscar dados do usuário:', error);
          return res.status(500).json({ success: false, error: 'Erro ao buscar dados do usuário' });
        }
      }

      // Validações básicas de entrada
      if (!tipo || typeof tipo !== 'string' || !allowedTypes.has(tipo)) {
        return res.status(400).json({ success: false, error: 'Tipo de registro inválido' });
      }
      
      // ✅ Validação opcional para grupoId e usuarioPerfilId
      if (grupoId && typeof grupoId !== 'string') {
        return res.status(400).json({ success: false, error: 'grupoId deve ser uma string válida' });
      }
      if (usuarioPerfilId && typeof usuarioPerfilId !== 'string') {
        return res.status(400).json({ success: false, error: 'usuarioPerfilId deve ser uma string válida' });
      }
      
      // ✅ Validação opcional para grupoId e usuarioPerfilId
      if (grupoId && typeof grupoId !== 'string') {
        return res.status(400).json({ success: false, error: 'grupoId deve ser uma string válida' });
      }
      if (usuarioPerfilId && typeof usuarioPerfilId !== 'string') {
        return res.status(400).json({ success: false, error: 'usuarioPerfilId deve ser uma string válida' });
      }
      
      // ✅ Localização é opcional - permitir registros mesmo sem geolocalização
      if (latitude !== undefined && longitude !== undefined && 
          (typeof latitude !== 'number' || typeof longitude !== 'number')) {
        return res.status(400).json({ success: false, error: 'Localização inválida (latitude/longitude devem ser números)' });
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
        
        // Se não é o primeiro tipo (entrada), validar se há registro anterior
        if (idx > 0) {
          const tipoAnterior = sequencia[idx - 1];
          
          // Verificar se há algum registro no dia
          const registrosHoje = await prisma.registroPonto.findMany({
            where: {
              usuarioId,
              dataHora: { gte: inicioDia, lt: fimDia },
            },
            orderBy: { dataHora: 'desc' },
            take: 1
          });
          
          if (registrosHoje.length === 0) {
            // Se não há registros no dia e não é entrada, permitir entrada
            if (tipo !== 'entrada') {
              logger.log('🚫 Validação de sequência falhou - primeiro registro deve ser entrada:', {
                tipoAtual: tipo,
                usuarioId,
                dataInicio: inicioDia,
                dataFim: fimDia
              });
              return res.status(422).json({ success: false, error: `Primeiro registro do dia deve ser 'entrada'` });
            }
          } else {
            // Se há registros, verificar sequência
            const temAnterior = await prisma.registroPonto.findFirst({
              where: {
                usuarioId,
                tipo: tipoAnterior,
                dataHora: { gte: inicioDia, lt: fimDia },
              },
            });
            if (!temAnterior) {
              logger.log('🚫 Validação de sequência falhou:', {
                tipoAtual: tipo,
                tipoAnterior,
                usuarioId,
                dataInicio: inicioDia,
                dataFim: fimDia
              });
              return res.status(422).json({ success: false, error: `É necessário registrar ${tipoAnterior} primeiro` });
            }
          }
        }
      }

      // ✅ Captura melhorada do IP real
      const getRealIP = (req: NextApiRequest): string => {
        // 1. X-Forwarded-For (mais confiável para proxies)
        const xForwardedFor = req.headers['x-forwarded-for'] as string;
        if (xForwardedFor) {
          // Pode conter múltiplos IPs separados por vírgula
          const ips = xForwardedFor.split(',').map(ip => ip.trim());
          return ips[0]; // Primeiro IP é o original
        }
        
        // 2. X-Real-IP (nginx)
        const xRealIP = req.headers['x-real-ip'] as string;
        if (xRealIP) return xRealIP;
        
        // 3. CF-Connecting-IP (Cloudflare)
        const cfConnectingIP = req.headers['cf-connecting-ip'] as string;
        if (cfConnectingIP) return cfConnectingIP;
        
        // 4. X-Client-IP (alguns proxies)
        const xClientIP = req.headers['x-client-ip'] as string;
        if (xClientIP) return xClientIP;
        
        // 5. Remote address (fallback)
        const remoteAddress = (req.socket as any)?.remoteAddress;
        if (remoteAddress && remoteAddress !== '::1' && remoteAddress !== '127.0.0.1') {
          return remoteAddress;
        }
        
        // 6. Se for localhost, tentar obter IP público via API externa
        return 'localhost'; // Será tratado abaixo
      };
      
      let ipAddress = getRealIP(req);
      
      // ✅ Priorizar IP do cliente se disponível
      if (clientIP && clientIP !== 'unknown' && clientIP !== '127.0.0.1') {
        ipAddress = clientIP;
      } else if (ipAddress === 'localhost' || ipAddress === '::1' || ipAddress === '127.0.0.1') {
        ipAddress = 'localhost-dev'; // Marcar claramente como desenvolvimento
      }
      
      // Log do IP capturado para debug
      logger.log('🌐 IP capturado para registro:', {
        ipAddress,
        clientIP,
        headers: {
          'x-forwarded-for': req.headers['x-forwarded-for'],
          'x-real-ip': req.headers['x-real-ip'],
          'cf-connecting-ip': req.headers['cf-connecting-ip'],
          'x-client-ip': req.headers['x-client-ip']
        }
      });
      
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

      // ✅ Criar endereço concatenado: número, rua, lat, lon
      let enderecoConcatenado = null;
      if (latitude && longitude) {
        const rua = endereco ? endereco.split(',')[0]?.trim() : 'Rua não identificada';
        const numero = numeroEndereco || 'N/A';
        enderecoConcatenado = `${numero} • ${rua} • Lat: ${latitude.toFixed(6)}, Lon: ${longitude.toFixed(6)}`;
      }

      const created = await prisma.registroPonto.create({
        data: {
          usuarioId,
          dispositivoId: dispositivo.id,
          dataHora: new Date(),
          tipo,
          observacao: overrideJustification 
            ? `OVERRIDE: ${overrideJustification}${observacao ? ' | ' + observacao : ''}` 
            : (latitude && longitude 
                ? (observacao || undefined)
                : `REGISTRO SEM GEOLOCALIZAÇÃO - PENDENTE DE APROVAÇÃO${observacao ? ' | ' + observacao : ''}`),
          latitude,
          longitude,
          precisao: precise ?? 0,
          endereco: enderecoConcatenado,
          numeroEndereco: numeroEndereco || null,
          nomeRedeWiFi: wifiName ?? null,
          enderecoIP: ipAddress || '0.0.0.0',
          aprovado: latitude && longitude ? aprovado : false, // ✅ Tratar sem localização como impreciso (pendente)
          aprovadoPor: latitude && longitude ? aprovadoPor : undefined,
          aprovadoEm: latitude && longitude ? aprovadoEm : undefined,
          dentroGeofence: latitude && longitude ? dentroGeofence : false,
          hashIntegridade,
          grupoId: usuarioGrupoId || null,
          usuarioPerfilId: usuarioPerfilIdFinal || null,
        },
      });

      // ✅ Salvar fingerprinting de rede para antifraude
      if (networkFingerprint) {
        try {
          await prisma.networkFingerprint.create({
            data: {
              usuarioId,
              connectionType: networkFingerprint.connectionType,
              effectiveType: networkFingerprint.effectiveType,
              downlink: networkFingerprint.downlink,
              rtt: networkFingerprint.rtt,
              ipAddress: networkFingerprint.ipAddress,
              timezone: networkFingerprint.timezone,
              language: networkFingerprint.language,
              userAgent: networkFingerprint.userAgent,
              platform: networkFingerprint.platform,
              screenResolution: networkFingerprint.screenResolution,
              connectionSpeed: `${networkFingerprint.downlink}Mbps`,
              connectionQuality: networkFingerprint.effectiveType,
              networkLatency: networkFingerprint.rtt,
              bandwidthEstimate: (networkFingerprint.downlink * 1000) / (networkFingerprint.rtt / 1000),
              timestamp: new Date(networkFingerprint.timestamp),
              sessionId: networkFingerprint.sessionId,
              riskScore: riskAnalysis?.riskScore || null,
              confidence: riskAnalysis?.confidence || null,
              anomalies: riskAnalysis?.anomalies ? JSON.stringify(riskAnalysis.anomalies) : null,
              isFraud: riskAnalysis?.isFraud || false,
              fraudReasons: riskAnalysis?.anomalies ? JSON.stringify(riskAnalysis.anomalies) : null,
              fraudConfidence: riskAnalysis?.fraudConfidence || null
            }
          });

          logger.log('🔍 Fingerprinting de rede salvo para antifraude:', {
            usuarioId,
            connectionType: networkFingerprint.connectionType,
            riskScore: riskAnalysis?.riskScore,
            isFraud: riskAnalysis?.isFraud
          });
        } catch (fingerprintError) {
          logger.log('⚠️ Erro ao salvar fingerprinting de rede:', fingerprintError);
          // Não falhar o registro por causa do fingerprinting
        }
      }

      // ✅ Integração com sistema de notificações
      try {
        // Buscar dados do usuário para a notificação
        const usuario = await prisma.usuario.findUnique({
          where: { id: usuarioId },
          select: { nomeCompleto: true }
        });

        if (usuario) {
          // Criar notificação se registro não foi aprovado automaticamente
          if (!aprovado) {
            await timeClockNotificationService.createPendingApprovalNotification({
              registroId: created.id,
              usuarioId,
              usuarioNome: usuario.nomeCompleto,
              tipoRegistro: tipo,
              endereco: endereco || 'Endereço não disponível',
              precisao: precise ?? 0,
              observacao: observacao
            });
          }

          // Criar notificação para problemas de geolocalização
          if (precise && precise > 100) { // Precisão maior que 100m
            await timeClockNotificationService.createGeolocationIssueNotification({
              usuarioId,
              usuarioNome: usuario.nomeCompleto,
              precisao: precise,
              endereco: endereco || 'Endereço não disponível',
              tipoRegistro: tipo
            });
          }
        }
      } catch (notificationError) {
        // Log do erro mas não falhar a criação do registro
        logger.error('Erro ao criar notificação:', notificationError);
      }

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
