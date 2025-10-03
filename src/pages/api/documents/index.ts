import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const documentos = await prisma.documento.findMany({
        include: {
          usuario: {
            select: {
              nomeCompleto: true,
              apelido: true,
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
      const documentosFormatados = documentos.map(doc => ({
        id: doc.id,
        name: doc.nome,
        description: doc.descricao,
        category: doc.categoria,
        type: doc.tipo,
        size: doc.tamanho,
        filePath: doc.caminhoArquivo,
        publicUrl: doc.urlPublica,
        hash: doc.hash,
        isValidated: doc.validado,
        validatedAt: doc.validadoEm?.toISOString(),
        validatedBy: doc.validadoPor,
        expirationDate: doc.dataVencimento?.toISOString().split('T')[0],
        expirationAlert: doc.alertaVencimento,
        permission: doc.permissao,
        tags: doc.tags,
        esocialReady: doc.esocialPronto,
        backupCreated: doc.backupCriado,
        createdAt: doc.criadoEm.toISOString(),
        updatedAt: doc.atualizadoEm.toISOString(),
        userId: doc.usuarioId,
        userName: doc.usuario.apelido || doc.usuario.nomeCompleto,
        sharedWith: doc.compartilhamentos.map(c => ({
          userId: c.usuarioId,
          userName: c.usuario.apelido || c.usuario.nomeCompleto,
          permission: c.permissao,
        })),
      }));

      return res.status(200).json({ success: true, data: documentosFormatados });
    } catch (error) {
      console.error('Erro ao buscar documentos:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao buscar documentos' 
      });
    }
  }

  if (req.method === 'POST') {
    try {
      const { 
        nome, 
        descricao, 
        categoria, 
        tipo,
        tamanho,
        caminhoArquivo,
        usuarioId,
        tags,
        permissao,
      } = req.body;
      
      const novoDocumento = await prisma.documento.create({
        data: {
          nome,
          descricao,
          categoria,
          tipo,
          tamanho,
          caminhoArquivo,
          usuarioId,
          tags: tags || [],
          permissao: permissao || 'PRIVADO',
          validado: false,
          alertaVencimento: false,
          esocialPronto: false,
          backupCriado: false,
        },
      });

      return res.status(201).json({ success: true, data: novoDocumento });
    } catch (error) {
      console.error('Erro ao criar documento:', error);
      return res.status(500).json({ 
        success: false, 
        error: 'Erro ao criar documento' 
      });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}

