import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { getCurrentUser } from '../../../lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const currentUser = await getCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Token de autenticação necessário' });
      }
      
      const userId = currentUser.userId;

      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1); // Segunda-feira
      inicioSemana.setHours(0, 0, 0, 0);

      // Buscar resumos de horas trabalhadas
      const resumoDia = await prisma.resumoHorasTrabalhadas.findFirst({
        where: {
          usuarioId: userId,
          dataReferencia: {
            gte: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()),
            lt: new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1)
          },
          periodo: 'DIA'
        }
      });

      const resumosSemana = await prisma.resumoHorasTrabalhadas.findMany({
        where: {
          usuarioId: userId,
          dataReferencia: {
            gte: inicioSemana,
            lt: new Date(inicioSemana.getTime() + 7 * 24 * 60 * 60 * 1000)
          },
          periodo: 'DIA'
        }
      });

      const resumosMes = await prisma.resumoHorasTrabalhadas.findMany({
        where: {
          usuarioId: userId,
          dataReferencia: {
            gte: inicioMes,
            lt: new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1)
          },
          periodo: 'DIA'
        }
      });

      // Calcular totais
      const totalSemana = resumosSemana.reduce((acc, resumo) => acc + resumo.horasTrabalhadas, 0);
      const totalMes = resumosMes.reduce((acc, resumo) => acc + resumo.horasTrabalhadas, 0);

      // Horários oficiais (8 horas por dia)
      const diasUteisSemana = 5;
      const diasUteisMes = 22; // Aproximadamente
      const horasOficiaisPorDia = 8;

      const summary = {
        day: {
          worked: resumoDia ? resumoDia.horasTrabalhadas * 60 : 0, // Converter para minutos
          expected: horasOficiaisPorDia * 60
        },
        week: {
          worked: totalSemana * 60,
          expected: diasUteisSemana * horasOficiaisPorDia * 60
        },
        month: {
          worked: totalMes * 60,
          expected: diasUteisMes * horasOficiaisPorDia * 60
        }
      };

      res.status(200).json({
        success: true,
        data: summary
      });
    } catch (error) {
      console.error('Erro ao buscar resumo de horas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).json({
      success: false,
      error: 'Método não permitido'
    });
  }
}
