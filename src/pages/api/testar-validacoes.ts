import { NextApiRequest, NextApiResponse } from 'next';
import { emailService } from '../../lib/emailService';
import { sendSMS } from '../../lib/smsConfig';
import { sendTwilioEmail } from '../../lib/twilioEmailConfig';

interface TestResult {
  service: string;
  status: 'success' | 'error' | 'not_configured';
  message: string;
  details?: any;
  timestamp: string;
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

  const { testType, email, telefone } = req.body;
  const results: TestResult[] = [];

  // Função helper para adicionar resultado
  const addResult = (
    service: string,
    status: TestResult['status'],
    message: string,
    details?: any
  ) => {
    results.push({
      service,
      status,
      message,
      details,
      timestamp: new Date().toISOString(),
    });
  };

  try {
    if (testType === 'sms' || testType === 'all') {
      if (!telefone) {
        addResult('SMS', 'error', 'Telefone não informado para teste');
      } else {
        try {
          // Verificar se as credenciais estão configuradas
          if (
            !process.env.TWILIO_ACCOUNT_SID ||
            !process.env.TWILIO_AUTH_TOKEN
          ) {
            addResult(
              'SMS',
              'not_configured',
              'Credenciais do Twilio não configuradas - usando fallback'
            );

            // Teste com credenciais de fallback
            const codigoTeste = Math.floor(
              100000 + Math.random() * 900000
            ).toString();
            const resultado = await sendSMS(telefone, codigoTeste);

            addResult(
              'SMS (Fallback)',
              'success',
              'SMS enviado com credenciais de fallback',
              {
                messageId: resultado.messageId,
                status: resultado.status,
                codigo: codigoTeste,
              }
            );
          } else {
            // Teste com credenciais do ambiente
            const codigoTeste = Math.floor(
              100000 + Math.random() * 900000
            ).toString();
            const resultado = await sendSMS(telefone, codigoTeste);

            addResult('SMS', 'success', 'SMS enviado com sucesso', {
              messageId: resultado.messageId,
              status: resultado.status,
              codigo: codigoTeste,
            });
          }
        } catch (error) {
          addResult('SMS', 'error', 'Erro ao enviar SMS', {
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          });
        }
      }
    }

    if (testType === 'email' || testType === 'all') {
      if (!email) {
        addResult('Email', 'error', 'Email não informado para teste');
      } else {
        const codigoTeste = Math.floor(
          100000 + Math.random() * 900000
        ).toString();

        // Testar Twilio SendGrid
        try {
          const resultadoTwilio = await sendTwilioEmail(
            email,
            codigoTeste,
            'email'
          );

          addResult(
            'Email (Twilio SendGrid)',
            'success',
            'Email enviado via Twilio SendGrid',
            {
              messageId: resultadoTwilio.messageId,
              provider: resultadoTwilio.provider,
              codigo: codigoTeste,
            }
          );
        } catch (error) {
          addResult(
            'Email (Twilio SendGrid)',
            'error',
            'Erro no Twilio SendGrid',
            {
              error:
                error instanceof Error ? error.message : 'Erro desconhecido',
            }
          );
        }

        // Testar EmailService (híbrido)
        try {
          const resultadoHibrido = await emailService.sendValidationEmail(
            email,
            codigoTeste,
            'email'
          );

          addResult(
            'Email (Híbrido)',
            'success',
            'Email enviado via serviço híbrido',
            {
              messageId: resultadoHibrido.messageId,
              provider: resultadoHibrido.provider,
              codigo: codigoTeste,
            }
          );
        } catch (error) {
          addResult('Email (Híbrido)', 'error', 'Erro no serviço híbrido', {
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          });
        }
      }
    }

    if (testType === 'config' || testType === 'all') {
      // Verificar configurações do Twilio SMS
      const twilioSmsConfig = {
        accountSid: !!process.env.TWILIO_ACCOUNT_SID,
        authToken: !!process.env.TWILIO_AUTH_TOKEN,
        phoneNumber: !!process.env.TWILIO_PHONE_NUMBER,
        fallbackSid: process.env.TWILIO_ACCOUNT_SID || 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        fallbackToken: process.env.TWILIO_AUTH_TOKEN || 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
        fallbackPhone: process.env.TWILIO_PHONE_NUMBER || '+1xxxxxxxxxx',
      };

      addResult(
        'Configuração SMS',
        'success',
        'Status das configurações SMS',
        twilioSmsConfig
      );

      // Verificar configurações do email
      const emailConfig = emailService.getProviderStatus();
      addResult(
        'Configuração Email',
        'success',
        'Status dos provedores de email',
        emailConfig
      );

      // Verificar variáveis de ambiente
      const envVars = {
        NODE_ENV: process.env.NODE_ENV,
        hasNextPublicUrl: !!process.env.NEXT_PUBLIC_APP_URL,
        hasJwtSecret: !!process.env.JWT_SECRET,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      };

      addResult(
        'Variáveis de Ambiente',
        'success',
        'Status das variáveis de ambiente',
        envVars
      );
    }

    // Resumo dos testes
    const summary = {
      total: results.length,
      success: results.filter(r => r.status === 'success').length,
      error: results.filter(r => r.status === 'error').length,
      not_configured: results.filter(r => r.status === 'not_configured').length,
    };

    return res.status(200).json({
      success: true,
      message: 'Testes de validação concluídos',
      testType,
      summary,
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Erro nos testes:', error);

    return res.status(500).json({
      success: false,
      message: 'Erro durante os testes',
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      results,
      timestamp: new Date().toISOString(),
    });
  }
}
