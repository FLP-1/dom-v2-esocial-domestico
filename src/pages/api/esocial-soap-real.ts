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
    const {
      action,
      cpfCnpj,
      environment,
      certificatePath,
      certificatePassword,
    } = req.body;

    if (!action || !cpfCnpj || !environment) {
      return res.status(400).json({
        success: false,
        error: 'Parâmetros obrigatórios: action, cpfCnpj, environment',
      });
    }

    // Configuração do eSocial
    const config = {
      environment: environment as 'homologacao' | 'producao',
      companyId: cpfCnpj,
      certificatePath,
      certificatePassword,
    };

    // Inicializar serviço SOAP
    const esocialSoap = new ESocialSoapReal(config);

    // Carregar certificado se fornecido
    if (certificatePath && certificatePassword) {
      try {
        // Caminho do certificado (assumindo que está na pasta public/certificates)
        const certPath = path.join(
          process.cwd(),
          'public',
          'certificates',
          certificatePath
        );

        if (!fs.existsSync(certPath)) {
          return res.status(400).json({
            success: false,
            error: 'Arquivo de certificado não encontrado',
          });
        }

        const certificateBuffer = fs.readFileSync(certPath);
        const certInfo = await esocialSoap.loadCertificate(
          certificateBuffer,
          certificatePassword
        );
      } catch (certError) {
        return res.status(400).json({
          success: false,
          error: `Erro ao carregar certificado: ${certError instanceof Error ? certError.message : 'Erro desconhecido'}`,
        });
      }
    }

    // Executar ação solicitada
    let result;

    switch (action) {
      case 'consultarEmpregador':
        result = await esocialSoap.consultarEmpregador();
        break;

      case 'consultarEmpregados':
        result = await esocialSoap.consultarEmpregados();
        break;

      case 'consultarEventos':
        result = await esocialSoap.consultarEventos();
        break;

      case 'testarConexao':
        // Teste básico de conectividade
        result = await esocialSoap.consultarEmpregador();
        break;

      default:
        return res.status(400).json({
          success: false,
          error: `Ação não suportada: ${action}`,
        });
    }

    // Retornar resultado
    if (result.success) {
      return res.status(200).json({
        success: true,
        data: result.data,
        message: 'Operação realizada com sucesso',
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error || 'Erro desconhecido',
      });
    }
  } catch (error) {
    console.error('❌ Erro na API SOAP Real:', error);
    return res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : 'Erro interno do servidor',
    });
  }
}
