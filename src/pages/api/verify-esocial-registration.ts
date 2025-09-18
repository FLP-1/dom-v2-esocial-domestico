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
    const { cpf, environment = 'homologacao' } = req.body;

    if (!cpf) {
      return res
        .status(400)
        .json({ success: false, error: 'CPF é obrigatório' });
    }

    // Configuração do eSocial
    const config = {
      environment: environment as 'homologacao' | 'producao',
      companyId: cpf,
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

    // Tentar consultar empregador
    const result = await esocialSoap.consultarEmpregador();

    const response = {
      timestamp: new Date().toISOString(),
      cpf: cpf,
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
      registration: {
        isRegistered: result.success,
        status: result.success ? 'CADASTRADO' : 'NÃO CADASTRADO',
        error: result.error,
        details: result.success
          ? 'CPF encontrado no eSocial'
          : 'CPF não encontrado ou sem permissão',
      },
      recommendation: result.success
        ? 'CPF está cadastrado no eSocial. Pode usar dados reais.'
        : 'CPF não está cadastrado no eSocial. Use dados simulados ou cadastre primeiro.',
    };

    return res.status(200).json({ success: true, data: response });
  } catch (error) {
    console.error('Erro ao verificar cadastro:', error);
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
