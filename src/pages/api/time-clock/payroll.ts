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

      // Buscar a última transferência de folha do usuário
      const lastPayrollTransfer = await prisma.transferenciaFolha.findFirst({
        where: {
          usuarioId: userId,
        },
        orderBy: { criadoEm: 'desc' },
      });

      // Buscar estatísticas de transferências
      const transferStats = await prisma.transferenciaFolha.groupBy({
        by: ['status'],
        where: {
          usuarioId: userId,
        },
        _count: {
          status: true,
        },
      });

      // Buscar próximas transferências programadas (próximos meses)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const upcomingTransfers = await prisma.transferenciaFolha.findMany({
        where: {
          usuarioId: userId,
          status: 'PENDENTE',
          OR: [
            { anoReferencia: currentYear, mesReferencia: { gte: currentMonth } },
            { anoReferencia: { gt: currentYear } }
          ]
        },
        orderBy: [{ anoReferencia: 'asc' }, { mesReferencia: 'asc' }],
        take: 3,
      });

      // Calcular total de transferências por mês (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyTransfers = await prisma.transferenciaFolha.groupBy({
        by: ['mesReferencia', 'anoReferencia'],
        where: {
          usuarioId: userId,
          criadoEm: {
            gte: sixMonthsAgo,
          },
        },
        _count: {
          id: true,
        },
        _sum: {
          valorTotal: true,
        },
      });

      const payrollData = {
        lastTransfer: lastPayrollTransfer,
        stats: transferStats,
        upcomingTransfers: upcomingTransfers,
        monthlyTransfers: monthlyTransfers,
        totalTransfers: transferStats.reduce((sum, stat) => sum + stat._count.status, 0),
      };

      res.status(200).json({
        message: 'Dados de folha de pagamento carregados com sucesso',
        data: payrollData,
      });
    } catch (error) {
      console.error('Erro ao buscar dados de folha de pagamento:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
