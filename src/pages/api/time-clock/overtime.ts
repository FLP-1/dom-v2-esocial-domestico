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

      // Buscar solicitações de hora extra pendentes
      const overtimeRequests = await prisma.solicitacaoHoraExtra.findMany({
        where: {
          usuarioId: userId,
          status: 'PENDENTE',
        },
        orderBy: { criadoEm: 'desc' },
        take: 5,
      });

      // Buscar resumos de horas para calcular horas extras
      const [daySummary, weekSummary, monthSummary] = await Promise.all([
        prisma.resumoHorasTrabalhadas.findUnique({
          where: {
            usuarioId_dataReferencia_periodo: {
              usuarioId: userId,
              dataReferencia: today,
              periodo: 'DIA',
            },
          },
        }),
        prisma.resumoHorasTrabalhadas.findFirst({
          where: {
            usuarioId: userId,
            dataReferencia: { gte: startOfWeek },
            periodo: 'SEMANA',
          },
          orderBy: { dataReferencia: 'desc' },
        }),
        prisma.resumoHorasTrabalhadas.findFirst({
          where: {
            usuarioId: userId,
            dataReferencia: { gte: startOfMonth },
            periodo: 'MES',
          },
          orderBy: { dataReferencia: 'desc' },
        }),
      ]);

      // Calcular horas extras (horas trabalhadas - horas oficiais)
      const calculateOvertime = (workedMinutes: number, officialMinutes: number) => {
        const overtime = workedMinutes - officialMinutes;
        return overtime > 0 ? overtime : 0;
      };

      const overtimeData = {
        day: {
          worked: daySummary?.horasTrabalhadas || 0,
          official: daySummary?.horasOficiais || 8 * 60, // 8 horas em minutos
          overtime: calculateOvertime(daySummary?.horasTrabalhadas || 0, daySummary?.horasOficiais || 8 * 60),
        },
        week: {
          worked: weekSummary?.horasTrabalhadas || 0,
          official: weekSummary?.horasOficiais || 40 * 60, // 40 horas em minutos
          overtime: calculateOvertime(weekSummary?.horasTrabalhadas || 0, weekSummary?.horasOficiais || 40 * 60),
        },
        month: {
          worked: monthSummary?.horasTrabalhadas || 0,
          official: monthSummary?.horasOficiais || 160 * 60, // 160 horas em minutos
          overtime: calculateOvertime(monthSummary?.horasTrabalhadas || 0, monthSummary?.horasOficiais || 160 * 60),
        },
      };

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
      const newOvertimeRequest = await prisma.solicitacaoHoraExtra.create({
        data: {
          usuarioId: userId,
          dataHora: dataHora ? new Date(dataHora) : new Date(),
          observacaoFuncionario: observacao || '',
          justificativaFuncionario: justificativa || '',
          status: 'PENDENTE',
          aprovadoPor: null,
          dataAprovacao: null,
        },
      });

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
