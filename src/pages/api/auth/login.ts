import type { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

/**
 * API para validar login (CPF + Senha)
 * POST /api/auth/login
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' })
  }

  try {
    const { cpf, senha } = req.body

    if (!cpf || !senha) {
      return res.status(400).json({
        success: false,
        error: 'CPF e senha são obrigatórios'
      })
    }

    // Remove máscara do CPF
    const cpfLimpo = cpf.replace(/[.\-\s]/g, '')

    // Valida se o CPF tem 11 dígitos
    if (!/^\d{11}$/.test(cpfLimpo)) {
      return res.status(400).json({
        success: false,
        error: 'CPF inválido'
      })
    }

    // Busca o usuário pelo CPF
    const usuario = await prisma.usuario.findUnique({
      where: { cpf: cpfLimpo },
      include: {
        perfis: {
          include: {
            perfil: true
          }
        }
      }
    })

    if (!usuario) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não encontrado'
      })
    }

    if (!usuario.ativo) {
      return res.status(401).json({
        success: false,
        error: 'Usuário inativo'
      })
    }

    // Valida a senha
    const senhaValida = await bcrypt.compare(senha, usuario.senhaHash)
    
    if (!senhaValida) {
      return res.status(401).json({
        success: false,
        error: 'Senha incorreta'
      })
    }

    // Mapeia os perfis do usuário para o formato do frontend
    const userProfiles = usuario.perfis
      .filter(up => up.ativo) // Apenas perfis ativos
      .map((up) => {
        const nomePartes = usuario.nomeCompleto.split(' ')
        const iniciais = nomePartes.length > 1
          ? `${nomePartes[0][0]}${nomePartes[nomePartes.length - 1][0]}`.toUpperCase()
          : nomePartes[0].substring(0, 2).toUpperCase()

        return {
          id: up.id,
          name: usuario.nomeCompleto,
          role: up.perfil.nome,
          avatar: iniciais,
          color: up.perfil.cor,
          cpf: usuario.cpf,
          dataNascimento: usuario.dataNascimento.toISOString().split('T')[0],
          endereco: {
            logradouro: usuario.logradouro || undefined,
            numero: usuario.numero || undefined,
            complemento: usuario.complemento || undefined,
            bairro: usuario.bairro || undefined,
            cidade: usuario.cidade || undefined,
            uf: usuario.uf || undefined,
            cep: usuario.cep || undefined
          },
          contato: {
            telefone: usuario.telefone,
            email: usuario.email
          }
        }
      })

    if (userProfiles.length === 0) {
      return res.status(403).json({
        success: false,
        error: 'Usuário não possui perfis ativos'
      })
    }

    return res.status(200).json({
      success: true,
      data: userProfiles,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('❌ Erro ao validar login:', error)
    return res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
      timestamp: new Date().toISOString()
    })
  }
}
