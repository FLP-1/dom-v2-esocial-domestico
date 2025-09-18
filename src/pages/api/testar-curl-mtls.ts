import { spawn } from 'child_process';
import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const { protocolo = '1.2.20250917.46410', cpfEmpregador = '59876913700' } =
    req.body;

  try {
    console.log('🧪 === TESTE cURL mTLS (RECOMENDAÇÃO) ===');

    // Verificar se certificado existe
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

    // Criar XML de consulta
    const xmlConsulta = `<?xml version="1.0" encoding="UTF-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
  <soap:Header/>
  <soap:Body>
    <cons:ConsultarLoteEventos xmlns:cons="http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0">
      <cons:ideEmpregador>
        <cons:tpInsc>2</cons:tpInsc>
        <cons:nrInsc>${cpfEmpregador}</cons:nrInsc>
      </cons:ideEmpregador>
      <cons:protocolo>${protocolo}</cons:protocolo>
    </cons:ConsultarLoteEventos>
  </soap:Body>
</soap:Envelope>`;

    // Salvar XML temporário
    const tempXmlPath = path.join(process.cwd(), 'temp-consulta.xml');
    fs.writeFileSync(tempXmlPath, xmlConsulta);

    // Salvar certificado temporário (PEM)
    console.log('🔄 Convertendo certificado para PEM...');

    // Usar OpenSSL para converter PFX para PEM
    const tempCertPath = path.join(process.cwd(), 'temp-cert.pem');
    const tempKeyPath = path.join(process.cwd(), 'temp-key.pem');

    // Comando para extrair certificado
    const extractCertResult = await executarComando('openssl', [
      'pkcs12',
      '-in',
      certPath,
      '-clcerts',
      '-nokeys',
      '-out',
      tempCertPath,
      '-passin',
      'pass:456587',
    ]);

    // Comando para extrair chave privada
    const extractKeyResult = await executarComando('openssl', [
      'pkcs12',
      '-in',
      certPath,
      '-nocerts',
      '-out',
      tempKeyPath,
      '-passin',
      'pass:456587',
      '-passout',
      'pass:',
    ]);

    if (!extractCertResult.success || !extractKeyResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Falha na conversão do certificado para PEM',
        details: {
          cert: extractCertResult.error,
          key: extractKeyResult.error,
        },
      });
    }

    console.log('✅ Certificado convertido para PEM');

    // === TESTE 1: Conectividade básica ===
    console.log('\n🔍 Teste 1: Conectividade básica...');
    const conectividadeResult = await executarComando('curl', [
      '-I',
      '-s',
      '-k',
      '--max-time',
      '30',
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
    ]);

    // === TESTE 2: WSDL com certificado ===
    console.log('\n🔍 Teste 2: WSDL com certificado...');
    const wsdlResult = await executarComando('curl', [
      '-s',
      '-k',
      '--max-time',
      '30',
      '--cert',
      tempCertPath,
      '--key',
      tempKeyPath,
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc?wsdl',
    ]);

    // === TESTE 3: Consulta SOAP completa ===
    console.log('\n🔍 Teste 3: Consulta SOAP completa...');
    const consultaResult = await executarComando('curl', [
      '-X',
      'POST',
      '-H',
      'Content-Type: text/xml; charset=utf-8',
      '-H',
      'SOAPAction: "http://www.esocial.gov.br/servicos/empregador/consultarloteeventos/v1_3_0/ConsultarLoteEventos"',
      '--cert',
      tempCertPath,
      '--key',
      tempKeyPath,
      '-k',
      '--max-time',
      '30',
      '-d',
      `@${tempXmlPath}`,
      'https://webservices.consulta.esocial.gov.br/servicos/empregador/consultarloteeventos/WsConsultarLoteEventos.svc',
    ]);

    // Limpar arquivos temporários
    try {
      fs.unlinkSync(tempXmlPath);
      fs.unlinkSync(tempCertPath);
      fs.unlinkSync(tempKeyPath);
    } catch (error) {
      console.log('⚠️ Aviso: Não foi possível limpar arquivos temporários');
    }

    // Compilar resultados
    const relatorio = {
      success: true,
      data: {
        configuracao: {
          protocolo: protocolo,
          cpfEmpregador: cpfEmpregador,
          xml_usado: xmlConsulta,
        },
        testes: {
          conectividade: {
            sucesso: conectividadeResult.success,
            saida: conectividadeResult.stdout,
            erro: conectividadeResult.error,
          },
          wsdl: {
            sucesso: wsdlResult.success,
            tamanho_resposta: wsdlResult.stdout?.length || 0,
            contem_wsdl: wsdlResult.stdout?.includes('<wsdl:') || false,
            erro: wsdlResult.error,
          },
          consulta_soap: {
            sucesso: consultaResult.success,
            resposta: consultaResult.stdout,
            tamanho_resposta: consultaResult.stdout?.length || 0,
            contem_soap_fault:
              consultaResult.stdout?.includes('<soap:Fault>') || false,
            erro: consultaResult.error,
          },
        },
        diagnostico: {
          conectividade_ok: conectividadeResult.success,
          certificado_aceito:
            wsdlResult.success && wsdlResult.stdout?.includes('<wsdl:'),
          consulta_funcional:
            consultaResult.success &&
            !consultaResult.stdout?.includes('<soap:Fault>'),
          problema_principal: identificarProblema(
            conectividadeResult,
            wsdlResult,
            consultaResult
          ),
        },
      },
      message: 'Teste cURL mTLS concluído',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro no teste cURL:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha no teste cURL mTLS',
    });
  }
}

// Executar comando e capturar saída
function executarComando(comando: string, args: string[]): Promise<any> {
  return new Promise(resolve => {
    const processo = spawn(comando, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    processo.stdout?.on('data', data => {
      stdout += data.toString();
    });

    processo.stderr?.on('data', data => {
      stderr += data.toString();
    });

    processo.on('close', code => {
      resolve({
        success: code === 0,
        stdout: stdout,
        stderr: stderr,
        error: code !== 0 ? stderr || `Código de saída: ${code}` : null,
      });
    });

    processo.on('error', error => {
      resolve({
        success: false,
        stdout: '',
        stderr: '',
        error: error.message,
      });
    });

    // Timeout
    setTimeout(() => {
      processo.kill();
      resolve({
        success: false,
        stdout: stdout,
        stderr: stderr,
        error: 'Timeout na execução do comando',
      });
    }, 45000);
  });
}

// Identificar problema principal
function identificarProblema(
  conectividade: any,
  wsdl: any,
  consulta: any
): string {
  if (!conectividade.success) {
    return 'Problema de conectividade - servidor não acessível';
  }

  if (!wsdl.success) {
    return 'Problema de autenticação - certificado não aceito ou WSDL inacessível';
  }

  if (!consulta.success) {
    return 'Problema na consulta SOAP - estrutura XML ou endpoint incorreto';
  }

  if (consulta.stdout?.includes('<soap:Fault>')) {
    return 'SOAP Fault retornado - erro específico do eSocial';
  }

  return 'Consulta aparentemente funcionou - verificar conteúdo da resposta';
}
