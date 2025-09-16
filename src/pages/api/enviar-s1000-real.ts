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
    }

    // DADOS DO EMPREGADOR PARA S-1000
    const dadosEmpregador = {
      ideEmpregador: {
        tpInsc: '1', // 1 = CNPJ, 2 = CPF
        nrInsc: cpf,
      },
      dadosCadastrais: {
        nmRazao: 'EMPREGADOR DOMÉSTICO',
        classTrib: '01', // 01 = Microempresa
        natJurid: '206-2', // 206-2 = Empregador Doméstico
        indCoop: '0', // 0 = Não é cooperativa
        indConstr: '0', // 0 = Não é construtora
        indDesFolha: '0', // 0 = Não desconta folha
        indOptRegEletron: '1', // 1 = Opta por registro eletrônico
        indEntEd: 'N', // N = Não é entidade educativa
        indEtt: 'N', // N = Não é ETT
        nrRegEtt: null,
        indSitPJ: '1', // 1 = Ativa
      },
      infoOp: {
        nrSiafi: '00000000',
        indUGRPPS: 'N',
        esferaOp: '01',
        poderOp: '01',
        vrTetoRem: '0.00',
        ideEFR: 'N',
        cnpjEFR: null,
      },
      infoOrgInternacional: {
        indAcordoIsenMulta: 'N',
      },
      softwareHouse: [
        {
          cnpjSoftHouse: '00000000000000',
          nmRazao: 'SOFTWARE HOUSE',
          nmCont: 'CONTATO',
          telefone: '11999999999',
          email: 'contato@softwarehouse.com.br',
        },
      ],
      infoComplementares: {
        situacaoPJ: {
          indSitPJ: '1',
        },
        situacaoPF: {
          indSitPF: '0',
        },
      },
    };

    console.log(
      '📤 Enviando evento S-1000 (Cadastramento Inicial do Empregador)...'
    );

    // ENVIAR EVENTO S-1000
    const resultado = await soapService.enviarEvento('S-1000', dadosEmpregador);

    if (resultado.success) {
      console.log('✅ Evento S-1000 enviado com sucesso!');
      console.log('📋 Protocolo:', resultado.protocolo);
    } else {
      console.log('❌ Erro ao enviar evento S-1000:', resultado.error);
    }

    return res.status(200).json({
      success: resultado.success,
      data: {
        evento: 'S-1000',
        descricao: 'Cadastramento Inicial do Empregador',
        cpf: cpf,
        ambiente: ambiente,
        protocolo: resultado.protocolo,
        status: resultado.success ? 'ENVIADO' : 'ERRO',
        detalhes: resultado,
        proximos_passos: resultado.success
          ? [
              'Aguardar processamento do evento',
              'Consultar status do protocolo',
              'Cadastrar empregados (S-2200)',
              'Enviar folha de pagamento (S-1200)',
            ]
          : [
              'Verificar dados do empregador',
              'Verificar certificado digital',
              'Verificar conectividade',
              'Tentar novamente',
            ],
      },
      message: resultado.success
        ? 'Evento S-1000 enviado com sucesso!'
        : 'Erro ao enviar evento S-1000',
    });
  } catch (error) {
    console.error('❌ Erro no envio do evento S-1000:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro no envio do evento S-1000',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
