// API para validação de geofencing
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
// import { getServerSession } from 'next-auth';
// import { authOptions } from '../auth/[...nextauth]';

// Função para calcular distância
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Raio da Terra em metros
  const φ1 = lat1 * Math.PI/180;
  const φ2 = lat2 * Math.PI/180;
  const Δφ = (lat2-lat1) * Math.PI/180;
  const Δλ = (lon2-lon1) * Math.PI/180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
          Math.cos(φ1) * Math.cos(φ2) *
          Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // Distância em metros
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  // TODO: Implementar autenticação adequada
  // const session = await getServerSession(req, res, authOptions);
  // if (!session?.user?.id) {
  //   return res.status(401).json({ error: 'Não autorizado' });
  // }
  
  // Obter ID do usuário atual (substitui mockUserId)
  const { getCurrentUserId } = await import('../../../lib/configService');
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  try {
    const { latitude, longitude, precisao, endereco, wifiName } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude e longitude são obrigatórios' });
    }

    // Buscar locais de trabalho do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: userId },
      include: { 
        gruposUsuario: { 
          include: { 
            grupo: { 
              include: { 
                locaisTrabalho: { 
                  where: { ativo: true } 
                } 
              } 
            } 
          } 
        } 
      }
    });

    if (!usuario) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Coletar todos os locais de trabalho
    const locaisTrabalho = usuario.gruposUsuario
      .flatMap(ug => ug.grupo.locaisTrabalho);

    if (locaisTrabalho.length === 0) {
      return res.status(400).json({ 
        error: 'Nenhum local de trabalho configurado',
        dentroGeofence: false,
        locais: []
      });
    }

    // Validar cada local
    const validacoes = locaisTrabalho.map(local => {
      const distancia = calculateDistance(
        latitude, longitude,
        local.latitude, local.longitude
      );
      
      return {
        localId: local.id,
        nome: local.nome,
        endereco: local.endereco,
        distancia: Math.round(distancia),
        dentroGeofence: distancia <= local.raio,
        raio: local.raio
      };
    });

    // Verificar se está dentro de pelo menos um local
    const dentroGeofence = validacoes.some(v => v.dentroGeofence);
    const localMaisProximo = validacoes.reduce((prev, current) => 
      (prev.distancia < current.distancia) ? prev : current
    );

    // Log da validação
    await prisma.geofencingValidacao.create({
      data: {
        localTrabalhoId: localMaisProximo.localId,
        usuarioId: userId,
        latitude,
        longitude,
        distancia: localMaisProximo.distancia,
        dentroGeofence,
        precisao: precisao || 0,
        endereco: endereco || null,
        wifiName: wifiName || null,
        ip: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'unknown',
        userAgent: req.headers['user-agent'] || 'unknown'
      }
    });

    // Resposta com análise de antifraude
    const analiseAntifraude = {
      dentroGeofence,
      localMaisProximo: {
        nome: localMaisProximo.nome,
        endereco: localMaisProximo.endereco,
        distancia: localMaisProximo.distancia,
        raio: localMaisProximo.raio
      },
      todosLocais: validacoes,
      precisao: precisao || 0,
      timestamp: new Date().toISOString(),
      // Análise de risco
      risco: {
        nivel: dentroGeofence ? 'BAIXO' : 'ALTO',
        motivo: dentroGeofence 
          ? 'Dentro do geofence autorizado' 
          : `Fora do geofence (${localMaisProximo.distancia}m do local mais próximo)`,
        recomendacao: dentroGeofence 
          ? 'Registro autorizado' 
          : 'Requer aprovação manual'
      }
    };

    return res.status(200).json(analiseAntifraude);

  } catch (error) {
    console.error('Erro na validação de geofencing:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
