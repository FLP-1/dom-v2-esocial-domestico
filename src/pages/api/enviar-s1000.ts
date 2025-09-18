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

    // Configuração do eSocial
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

    // Enviar S-1000
    const result = await esocialSoap.enviarS1000();

    const response = {
      timestamp: new Date().toISOString(),
      cpf: '59876913700',
      environment: environment,
      certificate: {
        subject: certInfo.subject,
        issuer: certInfo.issuer,
        validFrom: certInfo.validFrom,
        validTo: certInfo.validTo,
        serialNumber: certInfo.serialNumber,
        isValid:
          new Date() >= certInfo.validFrom && new Date() <= certInfo.validTo,
      },
      s1000: {
        success: result.success,
        protocolo: result.protocolo,
        error: result.error,
        details: result.success
          ? 'S-1000 enviado com sucesso!'
          : 'Erro ao enviar S-1000',
        data: result.data,
      },
      recommendation: result.success
        ? 'S-1000 enviado com sucesso! Aguarde processamento e teste a consulta.'
        : 'Erro ao enviar S-1000. Verifique os dados e tente novamente.',
    };

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Erro ao enviar S-1000:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
