import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const emprestimos = await prisma.emprestimo.findMany({
        include: {
          usuario: {
            select: {
              nomeCompleto: true,
              apelido: true,
              cpf: true,
            },
          },
        },
        orderBy: {
          criadoEm: 'desc',
        },
      });

      // Mapear para formato esperado pelo frontend
      const emprestimosFormatados = emprestimos.map(emp => ({
        id: emp.id,
        employeeName: emp.usuario.apelido || emp.usuario.nomeCompleto,
        employeeId: emp.usuarioId,
        cpf: emp.usuario.cpf,
        amount: Number(emp.valor),
        installmentValue: Number(emp.valorParcela),
        totalInstallments: emp.quantidadeParcelas,
        paidInstallments: emp.parcelasPagas,
        startDate: emp.dataConcessao.toISOString().split('T')[0],
        endDate: emp.dataVencimento.toISOString().split('T')[0],
        status: emp.status.toLowerCase(),
        notes: emp.observacao,
        createdAt: emp.criadoEm.toISOString(),
        updatedAt: emp.atualizadoEm.toISOString(),
      }));

      return res.status(200).json({ success: true, data: emprestimosFormatados });
    } catch (error) {
      console.error('Erro ao buscar empréstimos:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar empréstimos' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        usuarioId,
        valor,
        quantidadeParcelas,
        dataConcessao,
        observacao,
      } = req.body;

      const valorParcela = valor / quantidadeParcelas;
      const dataVencimento = new Date(dataConcessao);
      dataVencimento.setMonth(dataVencimento.getMonth() + quantidadeParcelas);
      
      const novoEmprestimo = await prisma.emprestimo.create({
        data: {
          usuarioId,
          valor,
          valorParcela,
          quantidadeParcelas,
          parcelasPagas: 0,
          dataConcessao: new Date(dataConcessao),
          dataVencimento,
          status: 'ATIVO',
          observacao,
        },
        include: {
          usuario: {
            select: {
              nomeCompleto: true,
              apelido: true,
            },
          },
        },
      });

      return res.status(201).json({ success: true, data: novoEmprestimo });
    } catch (error) {
      console.error('Erro ao criar empréstimo:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar empréstimo' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

