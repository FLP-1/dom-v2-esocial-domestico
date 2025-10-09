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
      const inicioHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
      const fimHoje = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() + 1);
      const inicioSemana = new Date(hoje);
      inicioSemana.setDate(hoje.getDate() - hoje.getDay() + 1);
      inicioSemana.setHours(0, 0, 0, 0);
      const fimSemana = new Date(inicioSemana.getTime() + 7 * 24 * 60 * 60 * 1000);
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 1);

      // Buscar registros para dia/semana/mês
      const [registrosDia, registrosSemana, registrosMes] = await Promise.all([
        prisma.registroPonto.findMany({
          where: { usuarioId: userId, dataHora: { gte: inicioHoje, lt: fimHoje } },
          orderBy: { dataHora: 'asc' }
        }),
        prisma.registroPonto.findMany({
          where: { usuarioId: userId, dataHora: { gte: inicioSemana, lt: fimSemana } },
          orderBy: { dataHora: 'asc' }
        }),
        prisma.registroPonto.findMany({
          where: { usuarioId: userId, dataHora: { gte: inicioMes, lt: fimMes } },
          orderBy: { dataHora: 'asc' }
        })
      ]);

      const calcularMinutosTrabalhados = (registros: any[]) => {
        let entrada: Date | null = null;
        let saidaAlmoco: Date | null = null;
        let retornoAlmoco: Date | null = null;
        let saida: Date | null = null;
        for (const r of registros) {
          switch (r.tipo) {
            case 'entrada': entrada = r.dataHora; break;
            case 'saida_almoco': saidaAlmoco = r.dataHora; break;
            case 'retorno_almoco': retornoAlmoco = r.dataHora; break;
            case 'saida': saida = r.dataHora; break;
          }
        }
        if (entrada && saida) {
          const total = saida.getTime() - entrada.getTime();
          const almoco = (saidaAlmoco && retornoAlmoco) ? (retornoAlmoco.getTime() - saidaAlmoco.getTime()) : 0;
          return Math.max(0, Math.floor((total - almoco) / 60000));
        }
        return 0;
      };

      const workedDay = calcularMinutosTrabalhados(registrosDia);
      const workedWeek = calcularMinutosTrabalhados(registrosSemana);
      const workedMonth = calcularMinutosTrabalhados(registrosMes);

      // Para manter o frontend estável, assumimos metas padrão
      const summary = {
        day: { worked: workedDay, expected: 8 * 60 },
        week: { worked: calcularMinutosTrabalhados(registrosSemana), expected: 40 * 60 },
        month: { worked: workedMonth, expected: 160 * 60 }
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
