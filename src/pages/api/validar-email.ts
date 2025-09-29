import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../lib/emailService';
import { sendTwilioEmail } from '../../lib/twilioEmailConfig';
// Interface para dados de validação
interface EmailValidationData {
  email: string;
  codigo?: string;
  action: 'enviar' | 'verificar';
  codigoInformado?: string;
  provider?: 'auto' | 'twilio' | 'nodemailer';
}
// Armazenamento temporário de códigos (em produção, use Redis ou banco de dados)
const codigosEmailValidacao = new Map<
  string,
  {
    codigo: string;
    expiraEm: number;
    tentativas: number;
    provider: string;
  }
>();
// Gerar código de validação
function gerarCodigoEmail(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// Validar formato do email
function validarFormatoEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
// Verificar se é um email temporário/descartável (lista básica)
function isEmailTemporario(email: string): boolean {
  const dominiosTemporarios = [
    '10minutemail.com',
    'guerrillamail.com',
    'mailinator.com',
    'tempmail.org',
    'yopmail.com',
    'temp-mail.org',
  ];
  const dominio = email.split('@')[1]?.toLowerCase();
  return dominio ? dominiosTemporarios.includes(dominio) : false;
}
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      message: `Método ${req.method} não permitido`,
    });
  }
  try {
    const {
      email,
      action,
      codigoInformado,
      provider = 'auto',
    }: EmailValidationData = req.body;
     + '***@' + email?.split('@')[1],
      provider,
    });
    // Validar dados de entrada
    if (!email || !action) {
      return res.status(400).json({
        success: false,
        message: 'Email e ação são obrigatórios',
      });
    }
    // Validar formato do email
    if (!validarFormatoEmail(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de email inválido',
      });
    }
    // Verificar se é email temporário
    if (isEmailTemporario(email)) {
      return res.status(400).json({
        success: false,
        message: 'Emails temporários não são permitidos',
      });
    }
    if (action === 'enviar') {
      // Gerar e enviar código de validação
      const codigo = gerarCodigoEmail();
      const expiraEm = Date.now() + 5 * 60 * 1000; // 5 minutos
      let resultado;
      let providerUsado = 'simulação';
      try {
        // Verificar status dos provedores
        const providerStatus = emailService.getProviderStatus();
        // Se nenhum provedor configurado, usar simulação
        if (
          !providerStatus.twilio.configured &&
          !providerStatus.nodemailer.configured
        ) {
          console.warn('⚠️ Nenhum provedor configurado, usando simulação');
          await new Promise(resolve => setTimeout(resolve, 1000));
          // Armazenar código mesmo em simulação
          codigosEmailValidacao.set(email, {
            codigo,
            expiraEm,
            tentativas: 0,
            provider: 'simulação',
          });
          return res.status(200).json({
            success: true,
            message: 'Email de validação simulado enviado',
            email,
            codigo: codigo, // Em produção, NÃO retornar o código
            provider: 'simulação',
            expiraEm: new Date(expiraEm).toISOString(),
            timestamp: new Date().toISOString(),
          });
        }
        // Tentar envio baseado na preferência
        if (provider === 'twilio' && providerStatus.twilio.configured) {
          resultado = await sendTwilioEmail(email, codigo, 'email');
          providerUsado = 'twilio-sendgrid';
        } else if (
          provider === 'nodemailer' &&
          providerStatus.nodemailer.configured
        ) {
          resultado = await emailService.sendValidationEmail(
            email,
            codigo,
            'email'
          );
          providerUsado = resultado.provider;
        } else {
          // Auto-seleção (preferência: Twilio > Nodemailer)
          if (providerStatus.twilio.configured) {
            resultado = await sendTwilioEmail(email, codigo, 'email');
            providerUsado = 'twilio-sendgrid';
          } else {
            resultado = await emailService.sendValidationEmail(
              email,
              codigo,
              'email'
            );
            providerUsado = resultado.provider;
          }
        }
        // Armazenar código
        codigosEmailValidacao.set(email, {
          codigo,
          expiraEm,
          tentativas: 0,
          provider: providerUsado,
        });
        return res.status(200).json({
          success: true,
          message: 'Email de validação enviado com sucesso',
          email,
          provider: providerUsado,
          messageId: resultado.messageId,
          expiraEm: new Date(expiraEm).toISOString(),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('❌ Erro ao enviar email:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao enviar email de validação',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        });
      }
    } else if (action === 'verificar') {
      // Verificar código informado
      if (!codigoInformado) {
        return res.status(400).json({
          success: false,
          message: 'Código de validação é obrigatório',
        });
      }
      const dadosValidacao = codigosEmailValidacao.get(email);
      if (!dadosValidacao) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum código de validação encontrado para este email',
        });
      }
      // Verificar se o código expirou
      if (Date.now() > dadosValidacao.expiraEm) {
        codigosEmailValidacao.delete(email);
        return res.status(400).json({
          success: false,
          message: 'Código de validação expirado. Solicite um novo código.',
        });
      }
      // Verificar número de tentativas
      if (dadosValidacao.tentativas >= 3) {
        codigosEmailValidacao.delete(email);
        return res.status(400).json({
          success: false,
          message: 'Muitas tentativas inválidas. Solicite um novo código.',
        });
      }
      // Verificar se o código está correto
      if (dadosValidacao.codigo !== codigoInformado) {
        dadosValidacao.tentativas++;
        return res.status(400).json({
          success: false,
          message: `Código inválido. Tentativas restantes: ${3 - dadosValidacao.tentativas}`,
        });
      }
      // Código válido - remover da memória
      codigosEmailValidacao.delete(email);
      return res.status(200).json({
        success: true,
        message: 'Email validado com sucesso!',
        email,
        provider: dadosValidacao.provider,
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Ação inválida. Use "enviar" ou "verificar"',
      });
    }
  } catch (error) {
    console.error('❌ Erro na validação de email:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
