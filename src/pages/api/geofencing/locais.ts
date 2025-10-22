// API para CRUD de locais de trabalho
import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

// Função para geocoding (endereço → coordenadas)
async function geocodeAddress(endereco: string) {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(endereco)}&limit=1&countrycodes=br&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'DOM-System/1.0 (Geofencing)',
        },
      }
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data && data.length > 0) {
        return {
          latitude: parseFloat(data[0].lat),
          longitude: parseFloat(data[0].lon),
          endereco: data[0].display_name
        };
      }
    }
    
    throw new Error('Endereço não encontrado');
  } catch (error) {
    throw new Error(`Erro no geocoding: ${error.message}`);
  }
}

// Função para log de auditoria
async function logGeofencingAction(
  localTrabalhoId: string,
  acao: string,
  dadosAnteriores: any,
  dadosNovos: any,
  usuarioId: string,
  req: NextApiRequest
) {
  await prisma.geofencingLog.create({
    data: {
      localTrabalhoId,
      acao,
      dadosAnteriores: dadosAnteriores ? JSON.stringify(dadosAnteriores) : null,
      dadosNovos: dadosNovos ? JSON.stringify(dadosNovos) : null,
      ip: req.headers['x-forwarded-for'] as string || req.connection.remoteAddress || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      usuarioId
    }
  });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // TODO: Implementar autenticação adequada
  // const session = await getServerSession(req, res, authOptions);
  // if (!session?.user?.id) {
  //   return res.status(401).json({ error: 'Não autorizado' });
  // }
  
  // Obter ID do usuário atual (substitui mockUserId)
  const { getCurrentUserId } = await import('../../../lib/configService');
  const userId = await getCurrentUserId();
  
  if (!userId) {
    return res.status(401).json({ error: 'Usuário não encontrado' });
  }

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        // Listar locais do grupo do usuário
        const usuario = await prisma.usuario.findUnique({
          where: { id: userId },
          include: { gruposUsuario: { include: { grupo: true } } }
        });

        if (!usuario) {
          return res.status(404).json({ error: 'Usuário não encontrado' });
        }

        const grupoIds = usuario.gruposUsuario.map(ug => ug.grupoId);
        
        const locais = await prisma.localTrabalho.findMany({
          where: {
            grupoId: { in: grupoIds },
            ativo: true
          },
          include: {
            grupo: true,
            empregador: { select: { nomeCompleto: true } },
            criador: { select: { nomeCompleto: true } }
          },
          orderBy: { criadoEm: 'desc' }
        });

        return res.status(200).json({ locais });

      case 'POST':
        // Criar novo local
        const { nome, endereco, raio = 200, grupoId } = req.body;

        if (!nome || !endereco || !grupoId) {
          return res.status(400).json({ error: 'Nome, endereço e grupo são obrigatórios' });
        }

        // Verificar se usuário tem permissão no grupo
        const temPermissao = await prisma.usuarioGrupo.findFirst({
          where: {
            usuarioId: mockUserId,
            grupoId,
            ativo: true
          }
        });

        if (!temPermissao) {
          return res.status(403).json({ error: 'Sem permissão para criar locais neste grupo' });
        }

        // Geocoding do endereço
        const coordenadasGeocoding = await geocodeAddress(endereco);

        // Criar local
        const novoLocal = await prisma.localTrabalho.create({
          data: {
            nome,
            endereco,
            latitude: coordenadasGeocoding.latitude,
            longitude: coordenadasGeocoding.longitude,
            raio,
            grupoId,
            empregadorId: mockUserId,
            criadoPor: mockUserId
          },
          include: {
            grupo: true,
            empregador: { select: { nomeCompleto: true } }
          }
        });

        // Log de auditoria
        await logGeofencingAction(
          novoLocal.id,
          'CREATE',
          null,
          novoLocal,
          mockUserId,
          req
        );

        return res.status(201).json({ local: novoLocal });

      case 'PUT':
        // Atualizar local
        const { id, nome: novoNome, endereco: novoEndereco, raio: novoRaio } = req.body;

        if (!id) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }

        // Buscar local atual
        const localAtual = await prisma.localTrabalho.findUnique({
          where: { id }
        });

        if (!localAtual) {
          return res.status(404).json({ error: 'Local não encontrado' });
        }

        // Verificar permissão
        const temPermissaoUpdate = await prisma.usuarioGrupo.findFirst({
          where: {
            usuarioId: mockUserId,
            grupoId: localAtual.grupoId,
            ativo: true
          }
        });

        if (!temPermissaoUpdate) {
          return res.status(403).json({ error: 'Sem permissão para editar este local' });
        }

        // Geocoding se endereço mudou
        let coordenadas = { latitude: localAtual.latitude, longitude: localAtual.longitude };
        if (novoEndereco && novoEndereco !== localAtual.endereco) {
          coordenadas = await geocodeAddress(novoEndereco);
        }

        // Atualizar local
        const localAtualizado = await prisma.localTrabalho.update({
          where: { id },
          data: {
            nome: novoNome || localAtual.nome,
            endereco: novoEndereco || localAtual.endereco,
            latitude: coordenadas.latitude,
            longitude: coordenadas.longitude,
            raio: novoRaio || localAtual.raio,
            atualizadoPor: mockUserId
          },
          include: {
            grupo: true,
            empregador: { select: { nomeCompleto: true } }
          }
        });

        // Log de auditoria
        await logGeofencingAction(
          id,
          'UPDATE',
          localAtual,
          localAtualizado,
          mockUserId,
          req
        );

        return res.status(200).json({ local: localAtualizado });

      case 'DELETE':
        // Desativar local (soft delete)
        const { id: localId } = req.body;

        if (!localId) {
          return res.status(400).json({ error: 'ID é obrigatório' });
        }

        // Buscar local
        const localParaDesativar = await prisma.localTrabalho.findUnique({
          where: { id: localId }
        });

        if (!localParaDesativar) {
          return res.status(404).json({ error: 'Local não encontrado' });
        }

        // Verificar permissão
        const temPermissaoDelete = await prisma.usuarioGrupo.findFirst({
          where: {
            usuarioId: mockUserId,
            grupoId: localParaDesativar.grupoId,
            ativo: true
          }
        });

        if (!temPermissaoDelete) {
          return res.status(403).json({ error: 'Sem permissão para excluir este local' });
        }

        // Desativar local
        const localDesativado = await prisma.localTrabalho.update({
          where: { id: localId },
          data: {
            ativo: false,
            atualizadoPor: mockUserId
          }
        });

        // Log de auditoria
        await logGeofencingAction(
          localId,
          'DELETE',
          localParaDesativar,
          localDesativado,
          mockUserId,
          req
        );

        return res.status(200).json({ message: 'Local desativado com sucesso' });

      default:
        return res.status(405).json({ error: 'Método não permitido' });
    }
  } catch (error) {
    console.error('Erro na API de geofencing:', error);
    return res.status(500).json({ error: 'Erro interno do servidor' });
  }
}
