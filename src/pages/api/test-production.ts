import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { validateProductionConfig } from '../../config/production';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    // Validar configuração de produção
    const configValidation = validateProductionConfig();
    if (!configValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Configuração de produção inválida',
        details: configValidation.errors,
      });
    }

    const { testType = 'all' } = req.body;

    // Configuração de produção
    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: '59876913700',
      certificatePath: 'eCPF A1 24940271 (senha 456587).pfx',
      certificatePassword: '456587',
    };

    const esocialSoap = new ESocialSoapReal(config);

    // Carregar certificado
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      config.certificatePath
    );
    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        error: 'Certificado não encontrado',
        path: certPath,
      });
    }

    const certificateBuffer = fs.readFileSync(certPath);
    const certInfo = await esocialSoap.loadCertificate(
      certificateBuffer,
      config.certificatePassword
    );

    const results = {
      timestamp: new Date().toISOString(),
      environment: 'producao',
      cpf: '59876913700',
      certificate: {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom,
        validTo: certInfo.validTo,
        serialNumber: certInfo.serialNumber,
        isValid:
          new Date() >= certInfo.validFrom && new Date() <= certInfo.validTo,
        daysUntilExpiry: Math.ceil(
          (certInfo.validTo.getTime() - new Date().getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      },
      tests: [] as any[],
    };

    // Teste 1: Conectividade SSL
    if (testType === 'all' || testType === 'connectivity') {
      try {
        const https = require('https');
        const httpsAgent = new https.Agent({
          rejectUnauthorized: true, // Em produção, sempre validar
          keepAlive: true,
          timeout: 30000,
        });

        const axios = require('axios');
        const startTime = Date.now();

        const response = await axios.get(
          'https://webservices.producaorestrita.esocial.gov.br',
          {
            httpsAgent: httpsAgent,
            timeout: 30000,
            validateStatus: () => true,
          }
        );

        const endTime = Date.now();

        results.tests.push({
          test: 'conectividade_ssl_producao',
          status: 'SUCCESS',
          responseTime: `${endTime - startTime}ms`,
          success: true,
          statusCode: response.status,
          message: 'Conectividade SSL com produção estabelecida',
        });
      } catch (error) {
        results.tests.push({
          test: 'conectividade_ssl_producao',
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          success: false,
        });
      }
    }

    // Teste 2: Consulta de Empregador
    if (testType === 'all' || testType === 'consultation') {
      try {
        const consultaResult = await esocialSoap.consultarEmpregador();
        results.tests.push({
          test: 'consulta_empregador_producao',
          status: consultaResult.success ? 'SUCCESS' : 'ERROR',
          success: consultaResult.success,
          error: consultaResult.error,
          dataSource: consultaResult.success ? 'real_data' : 'error',
          message: consultaResult.success
            ? 'Consulta de empregador funcionando'
            : 'Erro na consulta',
        });
      } catch (error) {
        results.tests.push({
          test: 'consulta_empregador_producao',
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          success: false,
        });
      }
    }

    // Teste 3: Envio S-1000
    if (testType === 'all' || testType === 's1000') {
      try {
        const s1000Result = await esocialSoap.enviarS1000();
        results.tests.push({
          test: 'envio_s1000_producao',
          status: s1000Result.success ? 'SUCCESS' : 'ERROR',
          success: s1000Result.success,
          protocolo: s1000Result.protocolo,
          error: s1000Result.error,
          message: s1000Result.success
            ? 'S-1000 enviado com sucesso'
            : 'Erro no envio S-1000',
        });
      } catch (error) {
        results.tests.push({
          test: 'envio_s1000_producao',
          status: 'ERROR',
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          success: false,
        });
      }
    }

    // Calcular resumo
    const totalTests = results.tests.length;
    const successCount = results.tests.filter(t => t.success).length;
    const failureCount = totalTests - successCount;

    const summary = {
      totalTests,
      successCount,
      failureCount,
      successRate: `${Math.round((successCount / totalTests) * 100)}%`,
      environment: 'producao',
      recommendation:
        failureCount === 0
          ? 'Sistema pronto para produção!'
          : 'Verificar erros antes de usar em produção',
    };

    return res.status(200).json({
      success: true,
      data: results,
      summary,
    });
  } catch (error) {
    console.error('Erro no teste de produção:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
