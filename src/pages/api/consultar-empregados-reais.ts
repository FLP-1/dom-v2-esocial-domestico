import { NextApiRequest, NextApiResponse } from 'next';
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
    const { cpf = '59876913700', ambiente = 'producao' } = req.body;

    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpf,
    };

    const soapService = new ESocialSoapReal(config);

    // Carregar certificado
    const fs = require('fs');
    const path = require('path');
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    if (fs.existsSync(certPath)) {
      const certBuffer = fs.readFileSync(certPath);
      await soapService.loadCertificate(certBuffer, '456587');
    } else {
      return res.status(400).json({
        success: false,
        error: 'Certificado digital não encontrado',
      });
    }

    // Fazer consulta REAL no eSocial
    const resultado = await soapService.consultarEmpregados();

    if (resultado.success) {
      res.status(200).json({
        success: true,
        data: {
          timestamp: new Date().toISOString(),
          ambiente: ambiente,
          cpf_empregador: cpf,
          consulta_real: true,
          resultado_esocial: resultado.data,
          observacao: 'Dados reais consultados diretamente do eSocial',
        },
      });
    } else {
      res.status(200).json({
        success: false,
        data: {
          timestamp: new Date().toISOString(),
          ambiente: ambiente,
          cpf_empregador: cpf,
          consulta_real: true,
          erro: resultado.error,
          observacao: 'Erro na consulta real ao eSocial',
        },
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: `Erro na consulta real: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    });
  }
}
