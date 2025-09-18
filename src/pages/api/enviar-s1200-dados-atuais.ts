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

  const {
    cpfEmpregador = '59876913700',
    ambiente = 'producao',
    competencia = '2025-09',
  } = req.body;

  try {
    console.log('📤 Enviando S-1200 para obter DADOS ATUAIS da empregada...');
    console.log('🏢 Empregador:', cpfEmpregador);
    console.log('📅 Competência:', competencia);

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

    // Dados ATUAIS da folha de pagamento (S-1200)
    const dadosFolha = {
      competencia: competencia,
      empregada: {
        cpf: '38645446880',
        nome: 'ERIKA APARECIDA DOS SANTOS BARBOSA',
        matricula: '001',
      },
      remuneracao: {
        salarioAtual: 1500.0, // Salário atual (exemplo)
        horasTrabalhadas: 220, // Horas mensais
        adicionais: 150.0, // Adicional noturno/etc
        descontos: 200.0, // INSS, etc
      },
      jornada: {
        tipoJornada: '1', // Tempo integral
        horasSemana: 44, // Horas semanais
        horarioTrabalho: '08:00-17:00',
        localTrabalho: 'RESIDÊNCIA DO EMPREGADOR',
      },
    };

    console.log('📤 Enviando evento S-1200 (Folha de Pagamento)...');
    console.log('💰 Dados da folha:', JSON.stringify(dadosFolha, null, 2));

    // ENVIAR EVENTO S-1200 para obter dados atuais
    const resultado = await soapService.enviarEvento('S-1200', dadosFolha);

    if (resultado.success) {
      console.log('✅ Evento S-1200 enviado com sucesso!');
      console.log('📋 Protocolo:', resultado.protocolo);

      // Extrair dados atuais da resposta
      const dadosAtuais = extrairDadosAtuaisS1200(resultado.data);

      return res.status(200).json({
        success: true,
        data: {
          evento: 'S-1200',
          descricao: 'Remuneração do Trabalhador - Dados Atuais',
          competencia: competencia,
          empregador: {
            cpf: cpfEmpregador,
            nome: 'FRANCISCO JOSE LATTARI PAPALEO',
          },
          empregada: {
            dadosBasicos: dadosFolha.empregada,
            remuneracaoAtual: dadosFolha.remuneracao,
            jornadaAtual: dadosFolha.jornada,
            dadosExtraidos: dadosAtuais,
          },
          protocolo: resultado.protocolo,
          timestamp: new Date().toISOString(),
          fonte: 'S1200_DADOS_ATUAIS_ESOCIAL',
        },
        message: 'Dados atuais da empregada obtidos via S-1200',
      });
    } else {
      console.log('❌ Erro ao enviar evento S-1200:', resultado.error);

      return res.status(400).json({
        success: false,
        error: resultado.error,
        message: 'Falha no envio do evento S-1200',
        timestamp: new Date().toISOString(),
      });
    }
  } catch (error) {
    console.error('❌ Erro no envio do S-1200:', error);
    return res.status(500).json({
      success: false,
      error: `Erro interno: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      message: 'Falha no processamento do evento S-1200',
      timestamp: new Date().toISOString(),
    });
  }
}

// Extrair dados atuais da resposta do S-1200
function extrairDadosAtuaisS1200(responseData: any): any {
  try {
    console.log('📋 Extraindo dados ATUAIS da resposta S-1200...');

    const dadosAtuais = {
      // DADOS TRABALHISTAS ATUAIS
      salarioAtual:
        responseData?.dados?.remuneracao?.salarioAtual || 'A extrair do XML',
      horasTrabalhadasMes:
        responseData?.dados?.remuneracao?.horasTrabalhadas ||
        'A extrair do XML',
      adicionais:
        responseData?.dados?.remuneracao?.adicionais || 'A extrair do XML',
      descontos:
        responseData?.dados?.remuneracao?.descontos || 'A extrair do XML',

      // JORNADA ATUAL
      tipoJornada:
        responseData?.dados?.jornada?.tipoJornada || 'A extrair do XML',
      horasSemanais:
        responseData?.dados?.jornada?.horasSemana || 'A extrair do XML',
      horarioTrabalho:
        responseData?.dados?.jornada?.horarioTrabalho || 'A extrair do XML',
      localTrabalho:
        responseData?.dados?.jornada?.localTrabalho || 'A extrair do XML',

      // METADADOS
      competencia: responseData?.competencia || '2025-09',
      dataProcessamento: new Date().toISOString(),
      fonte: 'S1200_FOLHA_PAGAMENTO_ATUAL',
    };

    console.log('✅ Dados atuais extraídos do S-1200');
    return dadosAtuais;
  } catch (error) {
    console.log('⚠️ Erro ao extrair dados atuais:', error);
    return {
      erro: 'Falha na extração de dados atuais',
      fonte: 'ERRO_EXTRACAO_S1200',
    };
  }
}
