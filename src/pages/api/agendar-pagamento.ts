import { NextApiRequest, NextApiResponse } from 'next';

interface PaymentRequest {
  tipo: 'holerite' | 'guia_imposto' | 'salario' | 'imposto';
  valor: number;
  funcionarioId?: string;
  mes: string;
  ano: string;
  dataVencimento: string;
  descricao: string;
  categoria: 'salario' | 'inss' | 'fgts' | 'irrf' | 'outros';
  prioridade: 'baixa' | 'media' | 'alta';
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaymentResponse>
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    const {
      tipo,
      valor,
      funcionarioId,
      mes,
      ano,
      dataVencimento,
      descricao,
      categoria,
      prioridade,
    }: PaymentRequest = req.body;

    // Simular agendamento de pagamento
    const paymentId = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Aqui você integraria com o sistema financeiro real
    console.log('💰 Agendando pagamento:', {
      paymentId,
      tipo,
      valor,
      funcionarioId,
      mes,
      ano,
      dataVencimento,
      descricao,
      categoria,
      prioridade,
    });

    // Simular salvamento no sistema financeiro
    const paymentData = {
      id: paymentId,
      tipo,
      valor,
      funcionarioId,
      mes,
      ano,
      dataVencimento,
      descricao,
      categoria,
      prioridade,
      dataCriacao: new Date().toISOString(),
      status: 'AGENDADO',
      dataProcessamento: null,
      comprovante: null,
    };

    // Aqui você salvaria no banco de dados do sistema financeiro
    console.log('💾 Pagamento agendado:', paymentData);

    // Simular integração com sistema de pagamentos
    if (categoria === 'salario') {
      console.log('🏦 Integrando com sistema de pagamento de salários');
    } else if (categoria === 'inss') {
      console.log('🏛️ Integrando com sistema de pagamento de INSS');
    } else if (categoria === 'fgts') {
      console.log('🏦 Integrando com sistema de pagamento de FGTS');
    } else if (categoria === 'irrf') {
      console.log('🏛️ Integrando com sistema de pagamento de IRRF');
    }

    return res.status(200).json({
      success: true,
      paymentId,
    });
  } catch (error) {
    console.error('❌ Erro ao agendar pagamento:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor ao agendar pagamento',
    });
  }
}
