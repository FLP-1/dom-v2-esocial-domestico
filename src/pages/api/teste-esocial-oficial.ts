import * as fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';
import * as soap from 'soap';
import { WSSecurityCert } from 'soap';

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

    // Configuração dos ambientes com WSDLs oficiais
    const config = {
      homologacao: {
        nome: 'Homologação (Produção Restrita)',
        wsdlEmpregador:
          'https://svt.esocial.gov.br/consulta-cadastro/v1.1?wsdl',
        wsdlTrabalhador:
          'https://svt.esocial.gov.br/consulta-trabalhador/v1.1?wsdl',
        baseUrl: 'https://svt.esocial.gov.br',
      },
      producao: {
        nome: 'Produção',
        wsdlEmpregador:
          'https://servicos.esocial.gov.br/consulta-cadastro/v1.1?wsdl',
        wsdlTrabalhador:
          'https://servicos.esocial.gov.br/consulta-trabalhador/v1.1?wsdl',
        baseUrl: 'https://servicos.esocial.gov.br',
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

    // Caminhos dos certificados
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'eCPF A1 24940271 (senha 456587).pfx'
    );
    const keyPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'key.pem'
    );
    const certPemPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'cert.pem'
    );
    const passphrase = '456587';

    // 1. TESTE DE CARREGAMENTO DE CERTIFICADO
    try {
      let certLoaded = false;
      let keyLoaded = false;
      let certPemLoaded = false;

      // Verificar se o PFX existe
      if (fs.existsSync(certPath)) {
        const pfxBuffer = fs.readFileSync(certPath);
        certLoaded = pfxBuffer.length > 0;
      }

      // Verificar se key.pem existe
      if (fs.existsSync(keyPath)) {
        const keyBuffer = fs.readFileSync(keyPath);
        keyLoaded = keyBuffer.length > 0;
      }

      // Verificar se cert.pem existe
      if (fs.existsSync(certPemPath)) {
        const certPemBuffer = fs.readFileSync(certPemPath);
        certPemLoaded = certPemBuffer.length > 0;
      }

      const allCertsLoaded = certLoaded && keyLoaded && certPemLoaded;

      resultados.testes.push({
        nome: 'Carregamento de Certificado',
        status: allCertsLoaded ? 'sucesso' : 'erro',
        detalhes: {
          pfx_existe: certLoaded,
          key_pem_existe: keyLoaded,
          cert_pem_existe: certPemLoaded,
          todos_carregados: allCertsLoaded,
          caminhos: {
            pfx: certPath,
            key: keyPath,
            cert_pem: certPemPath,
          },
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Carregamento de Certificado',
        status: 'erro',
        detalhes: {
          erro: error.message,
          todos_carregados: false,
        },
      });
    }

    // 2. TESTE DE CONSULTA DE EMPREGADOR
    try {
      const pfx = fs.readFileSync(certPath);
      const key = fs.readFileSync(keyPath);
      const cert = fs.readFileSync(certPemPath);

      const soapOpts = {
        wsdl_options: {
          pfx,
          passphrase: passphrase,
          rejectUnauthorized: true,
        },
      };

      const consultaEmpregador = () => {
        return new Promise((resolve, reject) => {
          soap.createClient(
            ambiente.wsdlEmpregador,
            soapOpts,
            (err, client) => {
              if (err) return reject(err);

              client.setSecurity(new WSSecurityCert(key, cert, passphrase));

              client.ConsultarCadastroEmpregador(
                {
                  ideEmpregador: {
                    tpInsc: parseInt(tpInsc),
                    nrInsc: cpf.replace(/\D/g, ''),
                  },
                },
                (e, result) => {
                  if (e) return reject(e);
                  resolve(result);
                }
              );
            }
          );
        });
      };

      const empregadorResult = await consultaEmpregador();
      const empregadorSuccess = empregadorResult && !empregadorResult.fault;

      resultados.testes.push({
        nome: 'Consulta de Empregador',
        status: empregadorSuccess ? 'sucesso' : 'erro',
        detalhes: {
          wsdl: ambiente.wsdlEmpregador,
          cpf: cpf,
          tpInsc: tpInsc,
          resultado: empregadorResult,
          sucesso: empregadorSuccess,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Consulta de Empregador',
        status: 'erro',
        detalhes: {
          wsdl: ambiente.wsdlEmpregador,
          cpf: cpf,
          tpInsc: tpInsc,
          erro: error.message,
          sucesso: false,
        },
      });
    }

    // 3. TESTE DE CONSULTA DE TRABALHADOR
    try {
      const pfx = fs.readFileSync(certPath);
      const key = fs.readFileSync(keyPath);
      const cert = fs.readFileSync(certPemPath);

      const soapOpts = {
        wsdl_options: {
          pfx,
          passphrase: passphrase,
          rejectUnauthorized: true,
        },
      };

      const consultaTrabalhador = () => {
        return new Promise((resolve, reject) => {
          soap.createClient(
            ambiente.wsdlTrabalhador,
            soapOpts,
            (err, client) => {
              if (err) return reject(err);

              client.setSecurity(new WSSecurityCert(key, cert, passphrase));

              client.ConsultarCadastroTrabalhador(
                {
                  ideTrabalhador: {
                    cpfTrab: cpf.replace(/\D/g, ''),
                  },
                },
                (e, result) => {
                  if (e) return reject(e);
                  resolve(result);
                }
              );
            }
          );
        });
      };

      const trabalhadorResult = await consultaTrabalhador();
      const trabalhadorSuccess = trabalhadorResult && !trabalhadorResult.fault;

      resultados.testes.push({
        nome: 'Consulta de Trabalhador',
        status: trabalhadorSuccess ? 'sucesso' : 'erro',
        detalhes: {
          wsdl: ambiente.wsdlTrabalhador,
          cpf: cpf,
          resultado: trabalhadorResult,
          sucesso: trabalhadorSuccess,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Consulta de Trabalhador',
        status: 'erro',
        detalhes: {
          wsdl: ambiente.wsdlTrabalhador,
          cpf: cpf,
          erro: error.message,
          sucesso: false,
        },
      });
    }

    // 4. TESTE DE VALIDAÇÃO DE WSDLs
    try {
      const wsdlEmpregadorResponse = await fetch(ambiente.wsdlEmpregador, {
        method: 'GET',
        headers: { 'User-Agent': 'DOM-System/1.0' },
      });

      const wsdlTrabalhadorResponse = await fetch(ambiente.wsdlTrabalhador, {
        method: 'GET',
        headers: { 'User-Agent': 'DOM-System/1.0' },
      });

      const empregadorWSDLValid = wsdlEmpregadorResponse.status === 200;
      const trabalhadorWSDLValid = wsdlTrabalhadorResponse.status === 200;
      const bothWSDLsValid = empregadorWSDLValid && trabalhadorWSDLValid;

      resultados.testes.push({
        nome: 'Validação de WSDLs',
        status: bothWSDLsValid ? 'sucesso' : 'erro',
        detalhes: {
          empregador_wsdl: {
            url: ambiente.wsdlEmpregador,
            status: wsdlEmpregadorResponse.status,
            valido: empregadorWSDLValid,
          },
          trabalhador_wsdl: {
            url: ambiente.wsdlTrabalhador,
            status: wsdlTrabalhadorResponse.status,
            valido: trabalhadorWSDLValid,
          },
          ambos_validos: bothWSDLsValid,
        },
      });
    } catch (error) {
      resultados.testes.push({
        nome: 'Validação de WSDLs',
        status: 'erro',
        detalhes: {
          erro: error.message,
          ambos_validos: false,
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
      recomendacoes.push(
        '⚠️ Foram identificados problemas nos testes oficiais'
      );
      recomendacoes.push(
        '🔍 Verifique se os certificados estão corretamente configurados'
      );
      recomendacoes.push('📋 Confirme se os WSDLs oficiais estão acessíveis');
    }

    if (sucessos === totalTestes) {
      recomendacoes.push('✅ Todos os testes oficiais passaram');
      recomendacoes.push(
        '🚀 Sistema pronto para integração oficial com eSocial'
      );
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
    console.error('Erro no teste eSocial oficial:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro interno no teste eSocial oficial',
      details: error.message,
    });
  }
}
