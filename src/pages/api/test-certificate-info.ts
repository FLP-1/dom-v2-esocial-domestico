import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    // Configuração do eSocial
    const config = {
      environment: 'homologacao' as 'homologacao' | 'producao',
      companyId: '59876913700',
      certificatePath: 'eCPF A1 24940271 (senha 456587).pfx',
      certificatePassword: '456587',
    };

    // Inicializar serviço SOAP
    const esocialSoap = new ESocialSoapReal(config);

    // Verificar se arquivo existe
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      config.certificatePath
    );

    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        error: 'Arquivo de certificado não encontrado',
        path: certPath,
      });
    }

    // Obter informações do arquivo
    const stats = fs.statSync(certPath);

    try {
      // Carregar certificado
      const certificateBuffer = fs.readFileSync(certPath);
      const certInfo = await esocialSoap.loadCertificate(
        certificateBuffer,
        config.certificatePassword
      );

      const result = {
        timestamp: new Date().toISOString(),
        certificate: {
          file: {
            name: config.certificatePath,
            path: certPath,
            size: stats.size,
            lastModified: stats.mtime,
            exists: true,
          },
          info: {
            subject: certInfo.subject,
            issuer: certInfo.issuer,
            validFrom: certInfo.validFrom,
            validTo: certInfo.validTo,
            serialNumber: certInfo.serialNumber,
            isValid:
              new Date() >= certInfo.validFrom &&
              new Date() <= certInfo.validTo,
            daysUntilExpiry: Math.ceil(
              (certInfo.validTo.getTime() - new Date().getTime()) /
                (1000 * 60 * 60 * 24)
            ),
          },
          loaded: true,
        },
        environment: config.environment,
        companyId: config.companyId,
      };

      return res.status(200).json({
        success: true,
        data: result,
      });
    } catch (certError) {
      return res.status(400).json({
        success: false,
        error: `Erro ao carregar certificado: ${certError instanceof Error ? certError.message : 'Erro desconhecido'}`,
        certificate: {
          file: {
            name: config.certificatePath,
            path: certPath,
            size: stats.size,
            lastModified: stats.mtime,
            exists: true,
          },
          loaded: false,
        },
      });
    }
  } catch (error) {
    console.error('❌ Erro no teste de certificado:', error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}
