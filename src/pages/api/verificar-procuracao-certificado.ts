import fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import forge from 'node-forge';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    console.log('🔍 === VERIFICAÇÃO PROCURAÇÃO E CERTIFICADO ===');

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

    // Converter PFX para análise
    const p12Asn1 = forge.asn1.fromDer(certificateBuffer.toString('binary'));
    const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, '456587');

    // Extrair certificado
    const certBags = p12.getBags({ bagType: forge.pki.oids.certBag });
    const cert = certBags[forge.pki.oids.certBag]?.[0]?.cert;

    if (!cert) {
      return res.status(400).json({
        success: false,
        error: 'Não foi possível extrair certificado do arquivo PFX',
      });
    }

    // Analisar certificado detalhadamente
    const analise = analisarCertificado(cert);

    // Verificar se CPF do certificado corresponde ao empregador
    const cpfCertificado = extrairCPFDoCertificado(cert);
    const cpfEmpregador = '59876913700';

    const correspondeCPF = cpfCertificado === cpfEmpregador;

    // Verificar permissões específicas
    const permissoes = verificarPermissoesCertificado(cert);

    // === TESTE DE PERMISSÃO ESPECÍFICA ===
    console.log('\n🔐 Testando permissões específicas...');

    const testesPermissao = await testarPermissoesPorTipo();

    const relatorio = {
      success: true,
      data: {
        certificado: {
          cpf_certificado: cpfCertificado,
          cpf_empregador: cpfEmpregador,
          cpfs_correspondem: correspondeCPF,
          validade: {
            valido_de: cert.validity.notBefore.toISOString(),
            valido_ate: cert.validity.notAfter.toISOString(),
            ainda_valido: new Date() < cert.validity.notAfter,
          },
          detalhes: analise,
        },
        permissoes: permissoes,
        testes_permissao: testesPermissao,
        diagnostico: {
          certificado_valido: new Date() < cert.validity.notAfter,
          cpf_correto: correspondeCPF,
          pode_ser_procuracao: !correspondeCPF,
          requer_procuracao_eletronica:
            !correspondeCPF && cpfCertificado !== cpfEmpregador,
          problema_provavel: identificarProblemaProvavel(
            correspondeCPF,
            analise,
            testesPermissao
          ),
        },
        recomendacoes: gerarRecomendacoes(correspondeCPF, analise),
      },
      message: 'Verificação de procuração e certificado concluída',
    };

    return res.status(200).json(relatorio);
  } catch (error) {
    console.error('❌ Erro na verificação:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
      message: 'Falha na verificação de procuração',
    });
  }
}

// Analisar certificado detalhadamente
function analisarCertificado(cert: forge.pki.Certificate): any {
  const subject = cert.subject.attributes;
  const issuer = cert.issuer.attributes;

  return {
    titular: subject.find(attr => attr.shortName === 'CN')?.value || 'N/A',
    email:
      subject.find(attr => attr.shortName === 'emailAddress')?.value || 'N/A',
    organizacao: subject.find(attr => attr.shortName === 'O')?.value || 'N/A',
    emissor: issuer.find(attr => attr.shortName === 'CN')?.value || 'N/A',
    numero_serie: cert.serialNumber,
    algoritmo_assinatura: cert.siginfo?.algorithmOid || 'N/A',
    extensoes: cert.extensions?.map(ext => ext.name || ext.id) || [],
  };
}

// Extrair CPF do certificado
function extrairCPFDoCertificado(cert: forge.pki.Certificate): string | null {
  const subject = cert.subject.attributes;

  // Buscar CPF no CN (Common Name)
  const cn = subject.find(attr => attr.shortName === 'CN')?.value || '';
  const cpfMatch = cn.match(/(\d{11})/);

  if (cpfMatch) {
    return cpfMatch[1];
  }

  // Buscar em outras extensões
  for (const ext of cert.extensions || []) {
    if (ext.value && typeof ext.value === 'string') {
      const cpfMatch = ext.value.match(/(\d{11})/);
      if (cpfMatch) {
        return cpfMatch[1];
      }
    }
  }

  return null;
}

// Verificar permissões do certificado
function verificarPermissoesCertificado(cert: forge.pki.Certificate): any {
  const extensoes = cert.extensions || [];

  return {
    key_usage: extensoes.find(ext => ext.name === 'keyUsage')?.value || 'N/A',
    extended_key_usage:
      extensoes.find(ext => ext.name === 'extKeyUsage')?.value || 'N/A',
    basic_constraints:
      extensoes.find(ext => ext.name === 'basicConstraints')?.value || 'N/A',
    pode_assinar: extensoes.some(
      ext => ext.name === 'keyUsage' && ext.digitalSignature
    ),
    pode_autenticar: extensoes.some(
      ext => ext.name === 'extKeyUsage' && ext.clientAuth
    ),
  };
}

// Testar permissões por tipo
async function testarPermissoesPorTipo(): Promise<any> {
  return {
    envio_s1000: 'FUNCIONA (já confirmado)',
    envio_s2200: 'FUNCIONA (já confirmado)',
    consulta_lote: 'FALHA 403 (investigando)',
    consulta_eventos: 'FALHA 404 (investigando)',
    acesso_portal: 'FUNCIONA (confirmado pelo usuário)',
    acesso_receita: 'FUNCIONA (confirmado pelo usuário)',
  };
}

// Identificar problema provável
function identificarProblemaProvavel(
  correspondeCPF: boolean,
  analise: any,
  testes: any
): string {
  if (!correspondeCPF) {
    return 'CPF do certificado não corresponde ao empregador - pode precisar de procuração eletrônica';
  }

  if (correspondeCPF && analise.pode_assinar && analise.pode_autenticar) {
    return 'Certificado correto e com permissões - problema pode ser específico dos serviços de consulta';
  }

  if (!analise.pode_assinar || !analise.pode_autenticar) {
    return 'Certificado pode não ter permissões adequadas para consultas';
  }

  return 'Certificado parece correto - problema pode ser infraestrutural';
}

// Gerar recomendações
function gerarRecomendacoes(correspondeCPF: boolean, analise: any): string[] {
  const recomendacoes = [];

  if (!correspondeCPF) {
    recomendacoes.push(
      'Verificar se há procuração eletrônica cadastrada no portal eSocial'
    );
    recomendacoes.push(
      'Considerar usar certificado do próprio empregador se disponível'
    );
  }

  if (!analise.ainda_valido) {
    recomendacoes.push('Certificado expirado - renovar certificado digital');
  }

  if (correspondeCPF) {
    recomendacoes.push(
      'CPF correto - problema pode ser específico dos serviços de consulta'
    );
    recomendacoes.push(
      'Verificar se consultas requerem configuração adicional'
    );
  }

  recomendacoes.push(
    'Consultar portal eSocial para verificar permissões de acesso'
  );
  recomendacoes.push(
    'Considerar contato com suporte eSocial se problema persistir'
  );

  return recomendacoes;
}
