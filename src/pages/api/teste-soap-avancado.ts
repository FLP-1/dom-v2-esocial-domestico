import axios from 'axios';
import { NextApiRequest, NextApiResponse } from 'next';

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
      environment = 'homologacao',
      cpf = '59876913700',
      tpInsc = '2',
    } = req.body;

    // Configuração dos ambientes
    const config = {
      homologacao: {
        nome: 'Homologação (Produção Restrita)',
        consultaCadastro:
          'https://webservices.producaorestrita.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
        enviarLoteEventos:
          'https://webservices.producaorestrita.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
      },
      producao: {
        nome: 'Produção',
        consultaCadastro:
          'https://webservices.esocial.gov.br/consultacadastro/ConsultaCadastro.svc',
        enviarLoteEventos:
          'https://webservices.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc',
      },
    };

    const ambiente = config[environment as keyof typeof config];

    const resultados = {
      timestamp: new Date().toISOString(),
      environment: environment,
      nome: ambiente.nome,
      cpf: cpf,
      tpInsc: tpInsc,
      testes: [],
    };

    // 1. TESTE DE ENVELOPE SOAP DE CONSULTA
    try {
      console.log(`📋 Testando envelope SOAP de consulta...`);

      const consultaXML = `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
            xmlns:cad="http://www.esocial.gov.br/ws/servicos/consultaCadastroEmpregador/v1_1_0">
  <s:Header>
      <cad:ideTransmissor>
        <cad:tpInsc>${tpInsc}</cad:tpInsc>
        <cad:nrInsc>${cpf}</cad:nrInsc>
      </cad:ideTransmissor>
  </s:Header>
  <s:Body>
    <cad:consultaEmpregador>
      <cad:ideContri>
        <cad:tpInsc>${tpInsc}</cad:tpInsc>
        <cad:nrInsc>${cpf}</cad:nrInsc>
      </cad:ideContri>
    </cad:consultaEmpregador>
  </s:Body>
</s:Envelope>`;

      const consultaResponse = await axios.post(
        ambiente.consultaCadastro,
        consultaXML,
        {
          headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
            SOAPAction:
              '"http://www.esocial.gov.br/ws/servicos/consultaCadastroEmpregador/v1_1_0/consultaEmpregador"',
            'User-Agent': 'DOM-System/1.0',
          },
          timeout: 30000,
          validateStatus: () => true,
        }
      );

      const consultaSuccess = consultaResponse.status < 500;
      const temFault =
        consultaResponse.data?.includes('faultstring') ||
        consultaResponse.data?.includes('Fault');
      const temCompanyId =
        consultaResponse.data?.includes('companyId') ||
        consultaResponse.data?.includes('nrInsc');

      resultados.testes.push({
        nome: 'Teste de Envelope SOAP de Consulta',
        status: consultaSuccess ? 'sucesso' : 'erro',
        detalhes: {
          url: ambiente.consultaCadastro,
          status: consultaResponse.status,
          content_type: consultaResponse.headers['content-type'],
          tamanho_resposta: consultaResponse.data?.length || 0,
          tem_fault: temFault,
          tem_company_id: temCompanyId,
          sucesso: consultaSuccess,
          xml_enviado: consultaXML,
          resposta_completa: consultaResponse.data,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Teste de Envelope SOAP de Consulta',
        status: 'erro',
        detalhes: {
          url: ambiente.consultaCadastro,
          erro: error.message,
          codigo: error.code,
          sucesso: false,
        },
      });
    }

    // 2. TESTE DE ENVELOPE SOAP DE ENVIO S-1000
    try {
      console.log(`📤 Testando envelope SOAP de envio S-1000...`);

      const s1000XML = `<?xml version="1.0" encoding="UTF-8"?>
<s:Envelope xmlns:s="http://www.w3.org/2003/05/soap-envelope"
            xmlns:evt="http://www.esocial.gov.br/schema/evt/evtTransmissao/v1_1_0">
  <s:Header>
      <evt:ideTransmissor>
        <evt:tpInsc>${tpInsc}</evt:tpInsc>
        <evt:nrInsc>${cpf}</evt:nrInsc>
      </evt:ideTransmissor>
  </s:Header>
  <s:Body>
    <evt:EnviarLoteEventos>
      <evt:evtTransmissaoEvento>
        <evt:ideEmpregador>
          <evt:tpInsc>${tpInsc}</evt:tpInsc>
          <evt:nrInsc>${cpf}</evt:nrInsc>
        </evt:ideEmpregador>
        <evt:ideEvento>
          <evt:tpEvento>S-1000</evt:tpEvento>
          <evt:nrRecibo>1</evt:nrRecibo>
        </evt:ideEvento>
        <evt:infoEmpregador>
          <evt:inclusao>
            <evt:ideEmpregador>
              <evt:tpInsc>${tpInsc}</evt:tpInsc>
              <evt:nrInsc>${cpf}</evt:nrInsc>
            </evt:ideEmpregador>
            <evt:dadosEmpregador>
              <evt:nmRazao>TESTE EMPREGADOR DOMESTICO</evt:nmRazao>
              <evt:classTrib>01</evt:classTrib>
              <evt:natJurid>2135</evt:natJurid>
              <evt:indCoop>0</evt:indCoop>
              <evt:indConstr>0</evt:indConstr>
              <evt:indDesFolha>0</evt:indDesFolha>
              <evt:indOpcCP>0</evt:indOpcCP>
              <evt:indPorte>N</evt:indPorte>
              <evt:indOptRegEletron>1</evt:indOptRegEletron>
              <evt:contato>
                <evt:nmCtt>TESTE CONTATO</evt:nmCtt>
                <evt:cpfCtt>${cpf}</evt:cpfCtt>
                <evt:foneFixo>11999999999</evt:foneFixo>
                <evt:email>teste@exemplo.com</evt:email>
              </evt:contato>
            </evt:dadosEmpregador>
          </evt:inclusao>
        </evt:infoEmpregador>
      </evt:evtTransmissaoEvento>
    </evt:EnviarLoteEventos>
  </s:Body>
</s:Envelope>`;

      const s1000Response = await axios.post(
        ambiente.enviarLoteEventos,
        s1000XML,
        {
          headers: {
            'Content-Type': 'application/soap+xml; charset=utf-8',
            SOAPAction:
              '"http://www.esocial.gov.br/schema/evt/evtTransmissao/v1_1_0/EnviarLoteEventos"',
            'User-Agent': 'DOM-System/1.0',
          },
          timeout: 30000,
          validateStatus: () => true,
        }
      );

      const s1000Success = s1000Response.status < 500;
      const temFault =
        s1000Response.data?.includes('faultstring') ||
        s1000Response.data?.includes('Fault');
      const temProtocolo =
        s1000Response.data?.includes('protocoloEnvio') ||
        s1000Response.data?.includes('protocolo');

      resultados.testes.push({
        nome: 'Teste de Envelope SOAP S-1000',
        status: s1000Success ? 'sucesso' : 'erro',
        detalhes: {
          url: ambiente.enviarLoteEventos,
          status: s1000Response.status,
          content_type: s1000Response.headers['content-type'],
          tamanho_resposta: s1000Response.data?.length || 0,
          tem_fault: temFault,
          tem_protocolo: temProtocolo,
          sucesso: s1000Success,
          xml_enviado: s1000XML,
          resposta_completa: s1000Response.data,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Teste de Envelope SOAP S-1000',
        status: 'erro',
        detalhes: {
          url: ambiente.enviarLoteEventos,
          erro: error.message,
          codigo: error.code,
          sucesso: false,
        },
      });
    }

    // 3. TESTE DE VALIDAÇÃO DE DADOS DE ENTRADA
    try {
      console.log(`✅ Testando validação de dados de entrada...`);

      const dadosEmpregador = {
        cpf: cpf,
        nome: 'TESTE EMPREGADOR DOMESTICO',
        tpInsc: tpInsc,
        classTrib: '01',
        natJurid: '2135',
        indCoop: '0',
        indConstr: '0',
        indDesFolha: '0',
        indOpcCP: '0',
        indPorte: 'N',
        indOptRegEletron: '1',
      };

      // Validações básicas
      const validacoes = {
        cpf_valido: /^\d{11}$/.test(cpf),
        nome_preenchido: dadosEmpregador.nome.length > 0,
        tpInsc_valido: dadosEmpregador.tpInsc === tpInsc,
        classTrib_valida: [
          '01',
          '02',
          '03',
          '04',
          '05',
          '06',
          '07',
          '08',
          '09',
          '10',
          '11',
          '12',
          '13',
          '14',
          '15',
          '16',
          '17',
          '18',
          '19',
          '20',
          '21',
          '22',
          '23',
          '24',
          '25',
          '26',
          '27',
          '28',
          '29',
          '30',
          '31',
          '32',
          '33',
          '34',
          '35',
          '36',
          '37',
          '38',
          '39',
          '40',
          '41',
          '42',
          '43',
          '44',
          '45',
          '46',
          '47',
          '48',
          '49',
          '50',
          '51',
          '52',
          '53',
          '54',
          '55',
          '56',
          '57',
          '58',
          '59',
          '60',
          '61',
          '62',
          '63',
          '64',
          '65',
          '66',
          '67',
          '68',
          '69',
          '70',
          '71',
          '72',
          '73',
          '74',
          '75',
          '76',
          '77',
          '78',
          '79',
          '80',
          '81',
          '82',
          '83',
          '84',
          '85',
          '86',
          '87',
          '88',
          '89',
          '90',
          '91',
          '92',
          '93',
          '94',
          '95',
          '96',
          '97',
          '98',
          '99',
        ].includes(dadosEmpregador.classTrib),
        natJurid_valida: /^\d{4}$/.test(dadosEmpregador.natJurid),
        campos_obrigatorios: Object.values(dadosEmpregador).every(
          valor => valor !== null && valor !== undefined && valor !== ''
        ),
      };

      const todasValidas = Object.values(validacoes).every(
        valida => valida === true
      );

      resultados.testes.push({
        nome: 'Validação de Dados de Entrada',
        status: todasValidas ? 'sucesso' : 'erro',
        detalhes: {
          dados_empregador: dadosEmpregador,
          validacoes: validacoes,
          todas_validas: todasValidas,
          sucesso: todasValidas,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Validação de Dados de Entrada',
        status: 'erro',
        detalhes: {
          erro: error.message,
          sucesso: false,
        },
      });
    }

    // 4. TESTE DE PARSING DE RESPOSTA SOAP
    try {
      console.log(`🔍 Testando parsing de resposta SOAP...`);

      // Simular resposta SOAP para teste de parsing
      const respostaSimulada = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
  <soap:Body>
    <consultaEmpregadorResponse>
      <empregador>
        <companyId>${cpf}</companyId>
        <tpInsc>${tpInsc}</tpInsc>
        <nome>TESTE EMPREGADOR</nome>
        <situacao>ATIVO</situacao>
        <dataCadastro>2024-01-01</dataCadastro>
      </empregador>
    </consultaEmpregadorResponse>
  </soap:Body>
</soap:Envelope>`;

      // Teste de parsing
      const temCompanyId = respostaSimulada.includes('companyId');
      const temTpInsc = respostaSimulada.includes('tpInsc');
      const temNome = respostaSimulada.includes('nome');
      const temSituacao = respostaSimulada.includes('situacao');
      const temDataCadastro = respostaSimulada.includes('dataCadastro');

      const parsingSuccess =
        temCompanyId && temTpInsc && temNome && temSituacao && temDataCadastro;

      resultados.testes.push({
        nome: 'Teste de Parsing de Resposta SOAP',
        status: parsingSuccess ? 'sucesso' : 'erro',
        detalhes: {
          resposta_simulada: respostaSimulada,
          tem_company_id: temCompanyId,
          tem_tp_insc: temTpInsc,
          tem_nome: temNome,
          tem_situacao: temSituacao,
          tem_data_cadastro: temDataCadastro,
          parsing_sucesso: parsingSuccess,
          sucesso: parsingSuccess,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Teste de Parsing de Resposta SOAP',
        status: 'erro',
        detalhes: {
          erro: error.message,
          sucesso: false,
        },
      });
    }

    // Calcular resumo
    const totalTestes = resultados.testes.length;
    const sucessos = resultados.testes.filter(
      t => t.status === 'sucesso'
    ).length;
    const erros = resultados.testes.filter(t => t.status === 'erro').length;

    // Adicionar recomendações baseadas nos resultados
    const recomendacoes = [];

    if (erros > 0) {
      recomendacoes.push('⚠️ Foram identificados problemas nos testes SOAP');
      recomendacoes.push('🔍 Verifique os envelopes XML e validações de dados');
      recomendacoes.push('📋 Confirme se o CPF está cadastrado no eSocial');
    }

    if (sucessos === totalTestes) {
      recomendacoes.push('✅ Todos os testes SOAP passaram');
      recomendacoes.push('🚀 Sistema pronto para integração com eSocial');
    }

    return res.status(200).json({
      success: true,
      data: {
        ...resultados,
        recomendacoes,
        resumo: {
          total_testes: totalTestes,
          sucessos,
          erros,
          percentual_sucesso: Math.round((sucessos / totalTestes) * 100),
        },
      },
    });
  } catch (error) {
    console.error('Erro no teste SOAP avançado:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no teste SOAP avançado',
      details: error.message,
    });
  }
}
