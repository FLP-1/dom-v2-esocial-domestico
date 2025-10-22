import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const registros = await prisma.registroPonto.findMany({
        include: {
          usuario: {
            select: {
              nomeCompleto: true,
              apelido: true,
              cpf: true,
            },
          },
          dispositivo: {
            select: {
              nome: true,
              modelo: true,
              tipo: true,
            },
          },
        },
        orderBy: {
          dataHora: 'desc',
        },
        take: 100, // Limitar últimos 100 registros
      });

      const registrosFormatados = registros.map(reg => ({
        id: reg.id,
        employeeName: reg.usuario.apelido || reg.usuario.nomeCompleto,
        employeeId: reg.usuarioId,
        cpf: reg.usuario.cpf,
        dateTime: reg.dataHora.toISOString(),
        type: reg.tipo,
        location: {
          latitude: reg.latitude,
          longitude: reg.longitude,
          accuracy: reg.precisao,
          insideGeofence: reg.dentroGeofence,
        },
        device: {
          name: reg.dispositivo?.nome,
          model: reg.dispositivo?.modelo,
          type: reg.dispositivo?.tipo,
        },
        network: {
          ip: reg.enderecoIP,
          wifi: reg.nomeRedeWiFi,
        },
        approval: {
          approved: reg.aprovado,
          approvedBy: reg.aprovadoPor,
          approvedAt: reg.aprovadoEm?.toISOString(),
        },
        notes: reg.observacao,
        hash: reg.hashIntegridade,
      }));

      return res.status(200).json({ success: true, data: registrosFormatados });
    } catch (error) {
      console.error('Erro ao buscar registros de ponto:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar registros de ponto' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

