import { NextApiRequest, NextApiResponse } from 'next';
import { sendSMS } from '../../lib/smsConfig';
// Interface para dados de validação
interface ValidationData {
  telefone: string;
  codigo?: string;
  action: 'enviar' | 'verificar';
  codigoInformado?: string;
}
// Armazenamento temporário de códigos (em produção, use Redis ou banco de dados)
const codigosValidacao = new Map<
  string,
  {
    codigo: string;
    expiraEm: number;
    tentativas: number;
  }
>();
// Gerar código de validação
function gerarCodigo(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
// Validar formato do telefone brasileiro (aceita formato nacional e internacional)
function validarTelefoneBrasileiro(telefone: string): boolean {
  // Remove todos os caracteres não numéricos
  const numeroLimpo = telefone.replace(/\D/g, '');
  // Se tem código do país (55), remover para validar o número brasileiro
  let numeroBrasil = numeroLimpo;
  if (numeroLimpo.startsWith('55') && numeroLimpo.length >= 12) {
    numeroBrasil = numeroLimpo.substring(2); // Remove o 55
  }
  // Verifica se tem 10 ou 11 dígitos (com DDD)
  if (numeroBrasil.length < 10 || numeroBrasil.length > 11) {
    return false;
  }
  // Verifica se o DDD é válido (11 a 99)
  const ddd = parseInt(numeroBrasil.substring(0, 2));
  if (ddd < 11 || ddd > 99) {
    return false;
  }
  return true;
}
// Formatar telefone para formato internacional
function formatarTelefoneInternacional(telefone: string): string {
  const numeroLimpo = telefone.replace(/\D/g, '');
  // Se já tem código do país, retorna como está
  if (numeroLimpo.startsWith('55')) {
    return '+' + numeroLimpo;
  }
  // Adiciona código do Brasil (+55)
  return '+55' + numeroLimpo;
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
    const { telefone, action, codigoInformado }: ValidationData = req.body;
     +
        '****' +
        telefone?.substring(telefone.length - 4),
    });
    // Validar dados de entrada
    if (!telefone || !action) {
      return res.status(400).json({
        success: false,
        message: 'Telefone e ação são obrigatórios',
      });
    }
    // Validar formato do telefone
    if (!validarTelefoneBrasileiro(telefone)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de telefone inválido. Use o formato: (11) 99999-9999',
      });
    }
    const telefoneFormatado = formatarTelefoneInternacional(telefone);
    if (action === 'enviar') {
      // Gerar e enviar código de validação
      const codigo = gerarCodigo();
      const expiraEm = Date.now() + 5 * 60 * 1000; // 5 minutos
      // Armazenar código temporariamente
      codigosValidacao.set(telefone, {
        codigo,
        expiraEm,
        tentativas: 0,
      });
      try {
        // Verificar se as credenciais estão configuradas
        if (
          !process.env['TWILIO_ACCOUNT_SID'] &&
          !process.env['TWILIO_AUTH_TOKEN']
        ) {
          console.warn(
            '⚠️ Credenciais do Twilio não configuradas, usando modo simulação'
          );
          // Modo simulação
          await new Promise(resolve => setTimeout(resolve, 1000));
          return res.status(200).json({
            success: true,
            message: 'SMS de validação simulado enviado',
            telefone: telefoneFormatado,
            codigo: codigo, // Em produção, NÃO retornar o código
            modo: 'simulação',
            expiraEm: new Date(expiraEm).toISOString(),
            timestamp: new Date().toISOString(),
          });
        }
        // Envio real
        const resultado = await sendSMS(telefoneFormatado, codigo);
        return res.status(200).json({
          success: true,
          message: 'SMS de validação enviado com sucesso',
          telefone: telefoneFormatado,
          messageId: resultado.messageId,
          expiraEm: new Date(expiraEm).toISOString(),
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        console.error('❌ Erro ao enviar SMS:', error);
        return res.status(500).json({
          success: false,
          message: 'Erro ao enviar SMS de validação',
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
      const dadosValidacao = codigosValidacao.get(telefone);
      if (!dadosValidacao) {
        return res.status(400).json({
          success: false,
          message: 'Nenhum código de validação encontrado para este telefone',
        });
      }
      // Verificar se o código expirou
      if (Date.now() > dadosValidacao.expiraEm) {
        codigosValidacao.delete(telefone);
        return res.status(400).json({
          success: false,
          message: 'Código de validação expirado. Solicite um novo código.',
        });
      }
      // Verificar número de tentativas
      if (dadosValidacao.tentativas >= 3) {
        codigosValidacao.delete(telefone);
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
      codigosValidacao.delete(telefone);
      return res.status(200).json({
        success: true,
        message: 'Telefone validado com sucesso!',
        telefone: telefoneFormatado,
        timestamp: new Date().toISOString(),
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Ação inválida. Use "enviar" ou "verificar"',
      });
    }
  } catch (error) {
    console.error('❌ Erro na validação de telefone:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
