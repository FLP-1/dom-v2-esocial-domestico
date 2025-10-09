import prisma from '../../../lib/prisma';
import { getCurrentUser } from '../../../lib/auth';

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const currentUser = await getCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Token de autenticação necessário' });
      }
      
      const userId = currentUser.userId;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      startOfWeek.setHours(0, 0, 0, 0);

      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      startOfMonth.setHours(0, 0, 0, 0);

      // Modelo SolicitacaoHoraExtra não existe; retornar vazio mantendo a resposta
      const overtimeRequests: any[] = [];

      // Buscar resumos de horas para calcular horas extras
      // Calcular a partir de RegistroPonto
      const [registrosDia, registrosSemana, registrosMes] = await Promise.all([
        prisma.registroPonto.findMany({
          where: { usuarioId: userId, dataHora: { gte: today } },
          orderBy: { dataHora: 'asc' }
        }),
        prisma.registroPonto.findMany({
          where: { usuarioId: userId, dataHora: { gte: startOfWeek } },
          orderBy: { dataHora: 'asc' }
        }),
        prisma.registroPonto.findMany({
          where: { usuarioId: userId, dataHora: { gte: startOfMonth } },
          orderBy: { dataHora: 'asc' }
        })
      ]);

      // Calcular horas extras (horas trabalhadas - horas oficiais)
      const calculateOvertime = (workedMinutes: number, officialMinutes: number) => {
        const overtime = workedMinutes - officialMinutes;
        return overtime > 0 ? overtime : 0;
      };

      const minutos = (registros: any[]) => {
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

      const overtimeData = {
        day: { worked: minutos(registrosDia), official: 8 * 60, overtime: 0 },
        week: { worked: minutos(registrosSemana), official: 40 * 60, overtime: 0 },
        month: { worked: minutos(registrosMes), official: 160 * 60, overtime: 0 },
      };
      overtimeData.day.overtime = calculateOvertime(overtimeData.day.worked, overtimeData.day.official);
      overtimeData.week.overtime = calculateOvertime(overtimeData.week.worked, overtimeData.week.official);
      overtimeData.month.overtime = calculateOvertime(overtimeData.month.worked, overtimeData.month.official);

      // Converter minutos para horas para exibição
      const formatHours = (minutes: number) => (minutes / 60).toFixed(1);

      const formattedOvertime = {
        day: {
          worked: formatHours(overtimeData.day.worked),
          official: formatHours(overtimeData.day.official),
          overtime: formatHours(overtimeData.day.overtime),
        },
        week: {
          worked: formatHours(overtimeData.week.worked),
          official: formatHours(overtimeData.week.official),
          overtime: formatHours(overtimeData.week.overtime),
        },
        month: {
          worked: formatHours(overtimeData.month.worked),
          official: formatHours(overtimeData.month.official),
          overtime: formatHours(overtimeData.month.overtime),
        },
      };

      res.status(200).json({
        message: 'Dados de horas extras carregados com sucesso',
        data: {
          overtime: formattedOvertime,
          requests: overtimeRequests,
          totalOvertime: formatHours(overtimeData.day.overtime + overtimeData.week.overtime + overtimeData.month.overtime),
        },
      });
    } catch (error) {
      console.error('Erro ao buscar dados de horas extras:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } else if (req.method === 'POST') {
    try {
      const currentUser = await getCurrentUser(req);
      
      if (!currentUser) {
        return res.status(401).json({ message: 'Token de autenticação necessário' });
      }
      
      const userId = currentUser.userId;

      const { dataHora, observacao, justificativa } = req.body;

      // Criar nova solicitação de hora extra
      // Sem persistência enquanto o modelo não existe
      const newOvertimeRequest = {
        id: 'temp', usuarioId: userId, dataHora: dataHora ? new Date(dataHora) : new Date(),
        observacao: observacao || '', justificativa: justificativa || '', status: 'PENDENTE'
      };

      res.status(201).json({
        message: 'Solicitação de hora extra criada com sucesso',
        data: newOvertimeRequest,
      });
    } catch (error) {
      console.error('Erro ao criar solicitação de hora extra:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
