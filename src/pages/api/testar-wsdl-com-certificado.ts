import fs from 'fs';
import https from 'https';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
// Usar função existente do ESocialSoapReal
import { ESocialSoapReal } from '../../services/esocialSoapReal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Carregar certificado eCPF A1
    const certPath = path.join(
      process.cwd(),
      'public/certificates/eCPF A1 24940271 (senha 456587).pfx'
    );

    if (!fs.existsSync(certPath)) {
      return res.status(400).json({
        success: false,
        error: 'Certificado eCPF não encontrado',
      });
    }

    // Usar ESocialSoapReal para carregar certificado
    const config = {
      environment: 'producao' as 'producao' | 'homologacao',
      companyId: '59876913700',
    };

    const soapService = new ESocialSoapReal(config);
    const certificateBuffer = fs.readFileSync(certPath);
    await soapService.loadCertificate(certificateBuffer, '456587');

    // Obter cert e key do serviço
    const cert = (soapService as any).cert;
    const key = (soapService as any).key;

    // URLs dos WSDLs que retornaram 403 (precisam certificado)
    const wsdlsParaTestar = [
      {
        nome: 'WSDL Envio (que funciona)',
        url: 'https://webservices.envio.esocial.gov.br/servicos/empregador/enviarloteeventos/WsEnviarLoteEventos.svc?wsdl',
      },
      {
        nome: 'WSDL Consulta Lotes (403 sem cert)',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
      },
      {
        nome: 'WSDL Consulta Eventos',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultareventos/WsConsultarEventos.svc?wsdl',
      },
      {
        nome: 'WSDL Consulta Identificador',
        url: 'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultaridentificadorcadastro/WsConsultarIdentificadorCadastro.svc?wsdl',
      },
    ];

    const resultados = [];

    for (const wsdl of wsdlsParaTestar) {
      try {
        const resultado = await baixarWSDLComCertificado(wsdl.url, cert, key);

        resultados.push({
          nome: wsdl.nome,
          url: wsdl.url,
          sucesso: resultado.sucesso,
          tamanho_wsdl: resultado.conteudo?.length || 0,
          contem_schema: resultado.conteudo?.includes('<xs:schema') || false,
          contem_binding:
            resultado.conteudo?.includes('<wsdl:binding') || false,
          erro: resultado.erro || null,
          namespaces_encontrados: extrairNamespaces(resultado.conteudo || ''),
          operacoes_encontradas: extrairOperacoes(resultado.conteudo || ''),
        });

        if (resultado.sucesso) {
        } else {
        }
      } catch (error) {
        resultados.push({
          nome: wsdl.nome,
          url: wsdl.url,
          sucesso: false,
          erro: error.message,
        });
      }
    }

    // Compilar relatório
    const relatorio = {
      success: true,
      data: {
        certificado_usado: 'eCPF A1 24940271',
        wsdls_testados: resultados,
        resumo: {
          total: resultados.length,
          acessiveis: resultados.filter(r => r.sucesso).length,
          com_erro: resultados.filter(r => !r.sucesso).length,
        },
        descobertas: {
          certificado_funciona_para_wsdls: resultados.some(r => r.sucesso),
          namespaces_versao_atual: [
            ...new Set(resultados.flatMap(r => r.namespaces_encontrados || [])),
          ],
          operacoes_disponiveis: [
            ...new Set(resultados.flatMap(r => r.operacoes_encontradas || [])),
          ],
        },
      },
      message: 'Teste de acesso aos WSDLs com certificado eCPF concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste de WSDL com certificado',
    });
  }
}

// Baixar WSDL usando certificado
function baixarWSDLComCertificado(
  url: string,
  cert: string,
  key: string
): Promise<any> {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'GET',
      timeout: 15000,
      agent: new https.Agent({
        cert: cert,
        key: key,
        rejectUnauthorized: false, // Para testes iniciais
      }),
    };

    const req = https.request(url, options, res => {
      let data = '';

      res.on('data', chunk => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve({
            sucesso: true,
            conteudo: data,
            status: res.statusCode,
          });
        } else {
          resolve({
            sucesso: false,
            erro: `HTTP ${res.statusCode}`,
            conteudo: data,
          });
        }
      });
    });

    req.on('error', error => {
      reject(error);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Timeout na requisição WSDL'));
    });

    req.end();
  });
}

// Extrair namespaces do WSDL
function extrairNamespaces(wsdl: string): string[] {
  const matches = wsdl.match(/xmlns[^=]*="[^"]*"/g) || [];
  return matches.map(match => match.split('="')[1].replace('"', ''));
}

// Extrair operações do WSDL
function extrairOperacoes(wsdl: string): string[] {
  const matches = wsdl.match(/<wsdl:operation[^>]*name="([^"]*)"/g) || [];
  return matches.map(match => match.match(/name="([^"]*)"/)?.[1] || '');
}
