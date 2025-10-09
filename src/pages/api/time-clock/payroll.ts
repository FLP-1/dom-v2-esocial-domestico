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

      // Não existe modelo TransferenciaFolha no schema atual
      const lastPayrollTransfer = null;

      // Buscar estatísticas de transferências
      const transferStats: any[] = [];

      // Buscar próximas transferências programadas (próximos meses)
      const currentDate = new Date();
      const currentMonth = currentDate.getMonth() + 1;
      const currentYear = currentDate.getFullYear();
      
      const upcomingTransfers: any[] = [];

      // Calcular total de transferências por mês (últimos 6 meses)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const monthlyTransfers: any[] = [];

      // Usar FolhaPagamento existente no schema
      const latestPayroll = await prisma.folhaPagamento.findFirst({
        where: { usuarioId: userId },
        orderBy: { criadoEm: 'desc' }
      });

      const payrollData = {
        lastTransfer: latestPayroll,
        stats: transferStats,
        upcomingTransfers: upcomingTransfers,
        monthlyTransfers: monthlyTransfers,
        totalTransfers: 0,
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
