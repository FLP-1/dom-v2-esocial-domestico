import jwt from 'jsonwebtoken';
import { NextApiRequest } from 'next';
import { getCurrentUserId } from './configService';
import prisma from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function getCurrentUser(req: NextApiRequest): Promise<JWTPayload | null> {
  try {
    // Try to get token from Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      return verifyToken(token);
    }

    // Try to get token from cookies
    const token = req.cookies.token;
    if (token) {
      return verifyToken(token);
    }

    // For development/testing, use a default user from config
    if (process.env.NODE_ENV === 'development') {
      try {
        const userId = await getCurrentUserId();
        
        // Buscar dados reais do usuário no banco
        const user = await prisma.usuario.findUnique({
          where: { id: userId },
          include: {
            perfis: {
              where: { principal: true },
              include: {
                perfil: true
              }
            }
          }
        });
        
        await prisma.$disconnect();
        
        if (!user || user.perfis.length === 0) {
          console.error('Usuário de desenvolvimento sem perfis válidos');
          return null;
        }
        
        const primaryProfile = user.perfis[0].perfil;
        
        return {
          userId: userId,
          email: user.email,
          role: primaryProfile.codigo
        };
      } catch (error) {
        console.error('Erro ao obter usuário padrão:', error);
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (req: NextApiRequest, res: any) => {
    const user = await getCurrentUser(req);
    
    if (!user) {
      return res.status(401).json({ message: 'Token de autenticação necessário' });
    }

    // Add user to request object
    (req as any).user = user;
    return handler(req, res);
  };
}
