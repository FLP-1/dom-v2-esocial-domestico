/**
 * API para gerenciamento de usuários com validações
 * Endpoint: POST /api/users/manage
 */

import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import bcrypt from 'bcryptjs';
import ValidationService from '../../../services/validationService';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      error: 'Método não permitido' 
    });
  }

  try {
    const { action, data } = req.body;

    if (!action || !data) {
      return res.status(400).json({
        success: false,
        error: 'Ação e dados são obrigatórios'
      });
    }

    switch (action) {
      case 'create-user':
        return await createUser(data, res);
      
      case 'update-user':
        return await updateUser(data, res);
      
      case 'add-user-to-group':
        return await addUserToGroup(data, res);
      
      case 'remove-user-from-group':
        return await removeUserFromGroup(data, res);
      
      default:
        return res.status(400).json({
          success: false,
          error: 'Ação não reconhecida'
        });
    }

  } catch (error: any) {
    console.error('Erro no gerenciamento de usuários:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
}

async function createUser(data: any, res: NextApiResponse) {
  try {
    // Validar dados obrigatórios
    const { cpf, email, senha, nomeCompleto, dataNascimento, telefone, perfilId, grupoId } = data;
    
    if (!cpf || !email || !senha || !nomeCompleto || !dataNascimento || !telefone || !perfilId || !grupoId) {
      return res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
    }

    // Validar CPF e email únicos
    const validation = await ValidationService.validateUserCreation(cpf, email);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validation.errors
      });
    }

    // Validar se o perfil existe
    const perfil = await prisma.perfil.findUnique({
      where: { id: perfilId }
    });

    if (!perfil) {
      return res.status(400).json({
        success: false,
        error: 'Perfil não encontrado'
      });
    }

    // Validar regras específicas do grupo
    const groupValidation = await ValidationService.validateUserGroupAssignment({
      cpf,
      grupoId,
      perfilId
    });

    if (!groupValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Regras do grupo violadas',
        details: groupValidation.errors
      });
    }

    // Hash da senha
    const saltRounds = 12;
    const senhaHash = await bcrypt.hash(senha, saltRounds);
    const salt = bcrypt.genSaltSync(saltRounds);

    // Criar usuário
    const novoUsuario = await prisma.usuario.create({
      data: {
        cpf,
        email,
        nomeCompleto,
        dataNascimento: new Date(dataNascimento),
        telefone,
        senhaHash,
        salt,
        perfis: {
          create: {
            perfilId,
            ativo: true,
            principal: true
          }
        },
        gruposUsuario: {
          create: {
            grupoId,
            papel: perfil.codigo,
            ativo: true
          }
        }
      },
      include: {
        perfis: {
          include: {
            perfil: true
          }
        },
        gruposUsuario: {
          include: {
            grupo: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: novoUsuario.id,
        cpf: novoUsuario.cpf,
        nomeCompleto: novoUsuario.nomeCompleto,
        email: novoUsuario.email,
        perfis: novoUsuario.perfis.map(up => ({
          id: up.perfil.id,
          codigo: up.perfil.codigo,
          nome: up.perfil.nome
        })),
        grupos: novoUsuario.gruposUsuario.map(ug => ({
          id: ug.grupo.id,
          nome: ug.grupo.nome,
          papel: ug.papel
        }))
      }
    });

  } catch (error: any) {
    console.error('Erro ao criar usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao criar usuário'
    });
  }
}

async function updateUser(data: any, res: NextApiResponse) {
  try {
    const { usuarioId, cpf, email, nomeCompleto, dataNascimento, telefone } = data;
    
    if (!usuarioId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
    }

    // Validar CPF e email únicos (excluindo o usuário atual)
    const validation = await ValidationService.validateUserUpdate(usuarioId, cpf, email);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: validation.errors
      });
    }

    // Atualizar usuário
    const usuarioAtualizado = await prisma.usuario.update({
      where: { id: usuarioId },
      data: {
        ...(cpf && { cpf }),
        ...(email && { email }),
        ...(nomeCompleto && { nomeCompleto }),
        ...(dataNascimento && { dataNascimento: new Date(dataNascimento) }),
        ...(telefone && { telefone })
      },
      include: {
        perfis: {
          include: {
            perfil: true
          }
        },
        gruposUsuario: {
          include: {
            grupo: true
          }
        }
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: usuarioAtualizado
    });

  } catch (error: any) {
    console.error('Erro ao atualizar usuário:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao atualizar usuário'
    });
  }
}

async function addUserToGroup(data: any, res: NextApiResponse) {
  try {
    const { usuarioId, grupoId, perfilId } = data;
    
    if (!usuarioId || !grupoId || !perfilId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário, grupo e perfil são obrigatórios'
      });
    }

    // Buscar dados do usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { cpf: true }
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
    }

    // Validar regras do grupo
    const validation = await ValidationService.validateUserGroupAssignment({
      cpf: usuario.cpf,
      grupoId,
      perfilId,
      usuarioId
    });

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Regras do grupo violadas',
        details: validation.errors
      });
    }

    // Buscar perfil para obter o papel
    const perfil = await prisma.perfil.findUnique({
      where: { id: perfilId },
      select: { codigo: true }
    });

    if (!perfil) {
      return res.status(404).json({
        success: false,
        error: 'Perfil não encontrado'
      });
    }

    // Adicionar usuário ao grupo
    const usuarioGrupo = await prisma.usuarioGrupo.create({
      data: {
        usuarioId,
        grupoId,
        papel: perfil.codigo,
        ativo: true
      },
      include: {
        usuario: {
          select: {
            id: true,
            cpf: true,
            nomeCompleto: true
          }
        },
        grupo: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Usuário adicionado ao grupo com sucesso',
      data: usuarioGrupo
    });

  } catch (error: any) {
    console.error('Erro ao adicionar usuário ao grupo:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao adicionar usuário ao grupo'
    });
  }
}

async function removeUserFromGroup(data: any, res: NextApiResponse) {
  try {
    const { usuarioId, grupoId } = data;
    
    if (!usuarioId || !grupoId) {
      return res.status(400).json({
        success: false,
        error: 'ID do usuário e grupo são obrigatórios'
      });
    }

    // Validar se pode remover o usuário
    const validation = await ValidationService.validateUserGroupRemoval(usuarioId, grupoId);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Não é possível remover o usuário',
        details: validation.errors
      });
    }

    // Remover usuário do grupo (desativar)
    await prisma.usuarioGrupo.updateMany({
      where: {
        usuarioId,
        grupoId
      },
      data: {
        ativo: false
      }
    });

    return res.status(200).json({
      success: true,
      message: 'Usuário removido do grupo com sucesso'
    });

  } catch (error: any) {
    console.error('Erro ao remover usuário do grupo:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro ao remover usuário do grupo'
    });
  }
}
