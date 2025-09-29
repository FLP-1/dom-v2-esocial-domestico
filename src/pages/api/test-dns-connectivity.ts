import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
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
    const { environment = 'homologacao' } = req.body;

    // Configuração baseada no ambiente
    const config = {
      environment: environment as 'homologacao' | 'producao',
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
      environment,
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

    // URLs para teste de conectividade DNS
    const testUrls = {
      homologacao: [
        'https://webservices.producaorestrita.esocial.gov.br',
        'https://pre-esocial.serpro.gov.br', // Para comparar
      ],
      producao: [
        'https://webservices.esocial.gov.br',
        'https://webservices.producaorestrita.esocial.gov.br', // Para comparar
      ],
    };

    // Teste 1: Conectividade DNS com múltiplos endpoints
    for (const url of testUrls[environment]) {
      try {
        const axios = require('axios');
        const https = require('https');
        const startTime = Date.now();

        const httpsAgent = new https.Agent({
          rejectUnauthorized: false, // Temporariamente para teste
          keepAlive: true,
          timeout: 30000,
        });

        const response = await axios.get(url, {
          httpsAgent: httpsAgent,
          timeout: 30000,
          validateStatus: () => true,
        });

        const endTime = Date.now();
        const responseTime = `${endTime - startTime}ms`;

        results.tests.push({
          test: 'conectividade_dns',
          url: url,
          status: 'SUCCESS',
          responseTime,
          success: true,
          statusCode: response.status,
          message: `Conectividade DNS estabelecida com sucesso para ${url}`,
        });
      } catch (error) {
        results.tests.push({
          test: 'conectividade_dns',
          url: url,
          status: 'ERROR',
          success: false,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          message: `Falha na conectividade DNS para ${url}`,
        });
      }
    }

    // Teste 2: Consulta de empregador com endpoints funcionais
    try {
      const consultaResult = await esocialSoap.consultarEmpregador();
      results.tests.push({
        test: 'consulta_empregador_dns_corrigido',
        status: consultaResult.success ? 'SUCCESS' : 'ERROR',
        success: consultaResult.success,
        error: consultaResult.error,
        dataSource: consultaResult.success ? 'real_data' : 'error',
        message: consultaResult.success
          ? 'Consulta de empregador funcionando com DNS corrigido'
          : 'Erro na consulta com DNS corrigido',
      });
    } catch (error) {
      results.tests.push({
        test: 'consulta_empregador_dns_corrigido',
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        dataSource: 'error',
      });
    }

    // Teste 3: Envio S-1000 com DNS corrigido
    try {
      const s1000Result = await esocialSoap.enviarS1000();
      results.tests.push({
        test: 'envio_s1000_dns_corrigido',
        status: s1000Result.success ? 'SUCCESS' : 'ERROR',
        success: s1000Result.success,
        protocolo: s1000Result.protocolo,
        error: s1000Result.error,
        message: s1000Result.success
          ? 'S-1000 enviado com sucesso usando DNS corrigido'
          : 'Erro no envio S-1000 com DNS corrigido',
      });
    } catch (error) {
      results.tests.push({
        test: 'envio_s1000_dns_corrigido',
        status: 'ERROR',
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    }

    // Calcular estatísticas
    const totalTests = results.tests.length;
    const successCount = results.tests.filter(test => test.success).length;
    const failureCount = totalTests - successCount;

    const summary = {
      totalTests,
      successCount,
      failureCount,
      successRate: `${Math.round((successCount / totalTests) * 100)}%`,
      environment,
      recommendation:
        failureCount === 0
          ? 'Sistema funcionando perfeitamente com DNS corrigido!'
          : 'Verificar erros específicos de DNS e conectividade',
    };

    return res.status(200).json({
      success: true,
      data: results,
      summary,
    });
  } catch (error) {
    console.error('Erro no teste de conectividade DNS:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
