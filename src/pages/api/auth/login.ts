import prisma from '../../../lib/prisma';
import { generateToken } from '../../../lib/auth';
import bcrypt from 'bcryptjs';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { cpf, senha, locationData } = req.body;

      if (!cpf || !senha) {
        return res.status(400).json({ message: 'CPF e senha são obrigatórios' });
      }

      // Log da geolocalização recebida no login
      if (locationData) {
        console.log('📍 Geolocalização recebida no login:', {
          latitude: locationData.latitude,
          longitude: locationData.longitude,
          accuracy: locationData.accuracy,
          address: locationData.address,
          wifiName: locationData.wifiName,
          timestamp: locationData.timestamp
        });
      }

      // Buscar usuário pelo CPF
      const user = await prisma.usuario.findUnique({
        where: { cpf },
        include: {
          perfis: {
            include: {
              perfil: true,
            },
          },
        },
      });

      if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Verificar senha (está hasheada no banco com bcrypt)
      const isValidPassword = await bcrypt.compare(senha, user.senhaHash || '');

      if (!isValidPassword) {
        return res.status(401).json({ message: 'Credenciais inválidas' });
      }

      // Determinar o perfil principal
      const primaryProfile = user.perfis?.find(p => p.principal)?.perfil || user.perfis?.[0]?.perfil;

      // Gerar token JWT
      const token = generateToken({
        userId: user.id,
        email: user.email,
        role: primaryProfile?.codigo || 'USER',
      });

      // Definir cookie seguro
      res.setHeader('Set-Cookie', [
        `token=${token}; HttpOnly; Path=/; Max-Age=86400; SameSite=Strict; ${process.env.NODE_ENV === 'production' ? 'Secure' : ''}`,
      ]);

      // Preparar dados do usuário com perfis no formato esperado pelo frontend
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

      res.status(200).json({
        success: true,
        message: 'Login realizado com sucesso',
        data: userProfiles,
        user: {
          id: user.id,
          email: user.email,
          nomeCompleto: user.nomeCompleto,
          apelido: user.apelido,
          role: primaryProfile?.codigo || 'USER',
          avatar: primaryProfile?.avatar || user.apelido?.substring(0, 2).toUpperCase() || user.nomeCompleto?.substring(0, 2).toUpperCase() || 'U',
        },
        token,
      });
    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}