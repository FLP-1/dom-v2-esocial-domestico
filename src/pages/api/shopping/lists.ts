import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '@/lib/prisma';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const listas = await prisma.listaCompras.findMany({
        where: {
          ativa: true,
        },
        include: {
          usuario: {
            select: {
              nomeCompleto: true,
              apelido: true,
            },
          },
          itens: {
            orderBy: {
              ordem: 'asc',
            },
          },
          compartilhamentos: {
            include: {
              usuario: {
                select: {
                  nomeCompleto: true,
                  apelido: true,
                },
              },
            },
          },
        },
        orderBy: {
          criadoEm: 'desc',
        },
      });

      // Mapear para formato esperado pelo frontend
      const listasFormatadas = listas.map(lista => ({
        id: lista.id,
        name: lista.nome,
        category: lista.categoria,
        items: lista.itens.map(item => ({
          id: item.id,
          name: item.nome,
          quantity: item.quantidade,
          price: item.preco ? Number(item.preco) : undefined,
          category: item.categoria,
          isBought: item.comprado,
          notes: item.observacao,
          brand: item.marca,
          store: item.local,
        })),
        createdAt: lista.criadoEm.toISOString().split('T')[0],
        lastModified: lista.atualizadoEm.toISOString().split('T')[0],
        totalItems: lista.totalItens,
        boughtItems: lista.itensComprados,
        estimatedValue: Number(lista.valorEstimado),
        finalValue: lista.valorFinal ? Number(lista.valorFinal) : undefined,
        isCompleted: lista.concluida,
        sharedWith: lista.compartilhamentos.map(c => ({
          userId: c.usuarioId,
          userName: c.usuario.apelido || c.usuario.nomeCompleto,
          permission: c.permissao,
        })),
      }));

      return res.status(200).json({ success: true, data: listasFormatadas });
    } catch (error) {
      console.error('Erro ao buscar listas de compras:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar listas de compras' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { nome, categoria, usuarioId } = req.body;
      
      const novaLista = await prisma.listaCompras.create({
        data: {
          nome,
          categoria,
          usuarioId,
          totalItens: 0,
          itensComprados: 0,
          valorEstimado: 0,
          ativa: true,
          concluida: false,
        },
      });

      return res.status(201).json({ success: true, data: novaLista });
    } catch (error) {
      console.error('Erro ao criar lista de compras:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar lista de compras' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

