import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';
import { generateToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // Login iniciado
      
      const { cpf, senha, locationData } = req.body;
      // Dados recebidos para login

      if (!cpf || !senha) {
        // CPF ou senha ausentes
        return res.status(400).json({ message: 'CPF e senha são obrigatórios' });
      }

      // Log da geolocalização recebida no login
      if (locationData) {
        // Geolocalização recebida no login
      }

      // Buscar usuário pelo CPF no banco
      const user = await prisma.usuario.findUnique({
        where: { cpf },
        include: {
          perfis: {
            include: {
              perfil: true,
            },
          },
          gruposUsuario: {
            include: {
              grupo: true,
            },
          },
        },
      });

      if (!user) {
        // Usuário não encontrado
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Usuário encontrado

      // Verificar senha
      // Verificando senha
      const isValidPassword = await bcrypt.compare(senha, user.senhaHash || '');

      if (!isValidPassword) {
        // Senha inválida
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }
      
      // Senha válida

      // Validar se o usuário tem perfis
      if (!user.perfis || user.perfis.length === 0) {
        // Usuário sem perfis
        return res.status(400).json({ 
          message: 'Usuário sem perfis associados. Entre em contato com o administrador.' 
        });
      }

      // Usuário tem perfis

      // Gerar token JWT real
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: 'LOGIN' // Role temporário até escolher perfil
      });

      // Definir cookie seguro
      res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`,
      ]);

      // Preparar dados do usuário com perfis para o modal
      const userProfiles = user.perfis?.map(up => ({
        id: up.id,
        usuarioId: up.usuarioId,
        perfilId: up.perfilId,
        avatar: up.avatar || user.apelido?.substring(0, 2).toUpperCase() || user.nomeCompleto?.substring(0, 2).toUpperCase() || 'U',
        apelido: up.apelido || user.apelido,
        ativo: up.ativo,
        principal: up.principal,
        // Mapear para estrutura esperada pelo frontend
        name: user.nomeCompleto,
        nickname: up.apelido || user.apelido,
        role: up.perfil.codigo,
        color: up.perfil.cor,
        // Manter estrutura original também
        perfil: {
          id: up.perfil.id,
          codigo: up.perfil.codigo,
          nome: up.perfil.nome,
          descricao: up.perfil.descricao,
          cor: up.perfil.cor,
          icone: up.perfil.icone,
          ativo: up.perfil.ativo
        }
      })) || [];

      // Preparar dados dos grupos do usuário
      const userGroups = user.gruposUsuario?.map(ug => ({
        id: ug.grupo.id,
        nome: ug.grupo.nome,
        descricao: ug.grupo.descricao,
        cor: ug.grupo.cor,
        icone: ug.grupo.icone,
        tipo: ug.grupo.tipo,
        privado: ug.grupo.privado,
        ativo: ug.grupo.ativo,
        papel: ug.papel
      })) || [];


      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          userProfiles,
          userGroups
        },
        user: {
          id: user.id,
          email: user.email,
          nomeCompleto: user.nomeCompleto,
          apelido: user.apelido,
          avatar: user.apelido?.substring(0, 2).toUpperCase() || user.nomeCompleto?.substring(0, 2).toUpperCase() || 'U',
        },
        token,
      });

    } catch (error) {
      console.error('❌ Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}