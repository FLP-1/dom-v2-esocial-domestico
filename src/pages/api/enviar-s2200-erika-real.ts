import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { cpfEmpregador = '59876913700', ambiente = 'producao' } = req.body;

  try {
    console.log('📤 Enviando evento S-2200 REAL para Erika...');
    console.log('🏢 Empregador:', cpfEmpregador);
    console.log('🌍 Ambiente:', ambiente);

    // Configurar serviço eSocial
    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpfEmpregador,
    };

    const soapService = new ESocialSoapReal(config);

    // Carregar certificado
    const certPath = path.join(
      process.cwd(),
      'public/certificates/eCPF A1 24940271 (senha 456587).pfx'
    );

    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        error: 'Certificado digital não encontrado',
      });
    }

    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    console.log('🔐 Certificado carregado com sucesso');

    // Dados REAIS da Erika para envio do S-2200
    const dadosErika = {
      cpf: '38645446880',
      nome: 'ERIKA APARECIDA DOS SANTOS BARBOSA',
      dataNascimento: '1986-12-23',
      dataAdmissao: '2024-01-15',
      cargo: 'Empregada Doméstica',
      salario: 1412.0, // Salário mínimo 2024
      endereco: {
        logradouro: 'A SER DEFINIDO',
        numero: '000',
        bairro: 'CENTRO',
        cidade: 'CAMPINAS',
        uf: 'SP',
        cep: '13000000',
      },
    };

    console.log('📤 Enviando evento S-2200 para Erika...');
    console.log('👤 Dados da empregada:', JSON.stringify(dadosErika, null, 2));

    // ENVIAR EVENTO S-2200 usando o mesmo método que funciona para S-1000
    const resultado = await soapService.enviarEvento('S-2200', dadosErika);

    if (resultado.success) {
      console.log('✅ Evento S-2200 enviado com sucesso!');
      console.log('📋 Protocolo:', resultado.protocolo);
      console.log(
        '📋 Dados retornados:',
        JSON.stringify(resultado.data, null, 2)
      );

      // Extrair dados cadastrais da resposta
      const dadosCadastrais = extrairDadosCadastraisS2200(resultado.data);

      return res.status(200).json({
        success: true,
        data: {
          evento: 'S-2200',
          descricao: 'Cadastramento da Empregada Erika',
          empregador: {
            cpf: cpfEmpregador,
            nome: 'FRANCISCO JOSE LATTARI PAPALEO',
          },
          empregada: {
            ...dadosErika,
            protocolo: resultado.protocolo,
            status: 'CADASTRADA',
            dadosCadastrais: dadosCadastrais,
          },
          ambiente: ambiente,
          protocolo: resultado.protocolo,
          timestamp: new Date().toISOString(),
          fonte: 'S2200_ESOCIAL_REAL',
        },
        message: 'Evento S-2200 enviado e dados cadastrais extraídos',
      });
    } else {
      console.log('❌ Erro ao enviar evento S-2200:', resultado.error);

      return res.status(400).json({
        success: false,
        error: resultado.error,
        message: 'Falha no envio do evento S-2200',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Erro no envio do S-2200:', error);
    return res.status(500).json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      message: 'Falha no processamento do evento S-2200',
      timestamp: new Date().toISOString(),
    });
  }
}

// Função para extrair dados cadastrais da resposta do S-2200
function extrairDadosCadastraisS2200(responseData: any): any {
  try {
    console.log('📋 Extraindo dados cadastrais da resposta S-2200...');

    // A resposta do S-2200 pode conter dados cadastrais validados
    const dadosExtraidos = {
      cpfValidado: responseData?.dadosTrabalhador?.cpf || null,
      nomeValidado: responseData?.dadosTrabalhador?.nome || null,
      dataNascimentoValidada: responseData?.dadosTrabalhador?.dtNasc || null,
      situacaoCadastral: responseData?.situacaoCadastral || null,
      vinculo: responseData?.vinculo || null,
      fonte: 'RESPOSTA_S2200_ESOCIAL',
    };

    console.log(
      '✅ Dados cadastrais extraídos:',
      JSON.stringify(dadosExtraidos, null, 2)
    );
    return dadosExtraidos;
  } catch (error) {
    console.log('⚠️ Erro ao extrair dados cadastrais:', error);
    return {
      erro: 'Falha na extração de dados cadastrais',
      fonte: 'ERRO_EXTRACAO_S2200',
    };
  }
}
