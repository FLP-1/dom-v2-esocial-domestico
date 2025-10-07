/**
 * Script para criar arquivos de upload simulados
 * Cria arquivos PDF, imagens e documentos para teste
 */

const fs = require('fs');
const path = require('path');

// Dados dos empregados (mesmos do script principal)
const EMPREGADOS = [
  {
    id: 1, // Será atualizado após criação
    nome: 'João Silva Santos',
    cpf: '12345678901'
  },
  {
    id: 2, // Será atualizado após criação
    nome: 'Maria Oliveira Costa',
    cpf: '98765432109'
  }
];

// Tipos de documentos com conteúdo específico
const DOCUMENTOS = [
  {
    tipo: 'Atestado Médico',
    conteudo: 'Atestado Médico\n\nPaciente: {nome}\nCPF: {cpf}\n\nAtesto que o paciente esteve sob meus cuidados médicos e apresenta quadro que o impede de exercer suas atividades laborais normais.\n\nPeríodo: {periodo}\n\nDr. José Médico Silva\nCRM: 123456\nSão Paulo, {data}',
    extensao: 'pdf'
  },
  {
    tipo: 'Comprovante de Residência',
    conteudo: 'Comprovante de Residência\n\nNome: {nome}\nCPF: {cpf}\n\nComprovo que o(a) Sr(a) reside no endereço:\n{endereco}\n\nDesde: {periodo}\n\nConta de Energia Elétrica\nFornecedor: Enel Distribuição São Paulo\n\nSão Paulo, {data}',
    extensao: 'pdf'
  },
  {
    tipo: 'RG',
    conteudo: 'IDENTIDADE\n\nNome: {nome}\nCPF: {cpf}\nFiliação: Pai da Silva / Mãe da Silva\nNaturalidade: São Paulo/SP\nData de Nascimento: 15/01/1985\n\nÓrgão Expedidor: SSP/SP\nData de Expedição: 15/01/2003\n\nDocumento de identificação pessoal',
    extensao: 'pdf'
  },
  {
    tipo: 'CPF',
    conteudo: 'CADASTRO DE PESSOA FÍSICA\n\nNome: {nome}\nCPF: {cpf}\nSituação: Regular\nData de Nascimento: 15/01/1985\n\nReceita Federal do Brasil\nMinistério da Economia',
    extensao: 'pdf'
  },
  {
    tipo: 'Carteira de Trabalho',
    conteudo: 'CARTEIRA DE TRABALHO E PREVIDÊNCIA SOCIAL\n\nNome: {nome}\nCPF: {cpf}\nPIS: 123.45678.90-1\n\nAnotações de Trabalho:\n\nEmpresa: Empresa Teste LTDA\nCNPJ: 12.345.678/0001-90\nCargo: {cargo}\nAdmissão: {dataAdmissao}\nSalário: R$ {salario}\n\nMinistério do Trabalho e Emprego',
    extensao: 'pdf'
  },
  {
    tipo: 'Comprovante de Escolaridade',
    conteudo: 'DECLARAÇÃO DE ESCOLARIDADE\n\nDeclaro que {nome}, CPF {cpf}, concluiu com aprovação o curso de Ensino Superior em {curso}.\n\nPeríodo: 2018 - 2022\nCarga Horária: 3200 horas\n\nUniversidade Teste\nSão Paulo, {data}',
    extensao: 'pdf'
  },
  {
    tipo: 'Certificado de Curso',
    conteudo: 'CERTIFICADO\n\nCertifico que {nome}, CPF {cpf}, participou e concluiu com aproveitamento o curso:\n\n{curso}\n\nCarga Horária: 40 horas\nPeríodo: {periodo}\n\nInstituto de Capacitação Teste\nSão Paulo, {data}',
    extensao: 'pdf'
  },
  {
    tipo: 'Declaração de Imposto de Renda',
    conteudo: 'DECLARAÇÃO DE IMPOSTO DE RENDA\n\nDeclarante: {nome}\nCPF: {cpf}\nExercício: 2023\n\nRendimentos Tributáveis: R$ {rendimentos}\nImposto Retido na Fonte: R$ {irpf}\n\nReceita Federal do Brasil\nMinistério da Economia',
    extensao: 'pdf'
  }
];

function criarDiretorioUploads() {
  const uploadsDir = path.join(__dirname, 'public', 'uploads', 'documentos');
  
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('📁 Diretório de uploads criado:', uploadsDir);
  }
  
  return uploadsDir;
}

function gerarConteudoDocumento(template, empregado, documento) {
  const hoje = new Date();
  const dataAdmissao = new Date('2023-01-15'); // Data base
  
  return template.conteudo
    .replace(/{nome}/g, empregado.nome)
    .replace(/{cpf}/g, empregado.cpf)
    .replace(/{data}/g, hoje.toLocaleDateString('pt-BR'))
    .replace(/{periodo}/g, '01/01/2024 a 31/12/2024')
    .replace(/{endereco}/g, 'Rua das Flores, 123 - Centro - São Paulo/SP')
    .replace(/{cargo}/g, empregado.nome.includes('João') ? 'Desenvolvedor Senior' : 'Analista de RH')
    .replace(/{dataAdmissao}/g, dataAdmissao.toLocaleDateString('pt-BR'))
    .replace(/{salario}/g, empregado.nome.includes('João') ? '8.500,00' : '6.500,00')
    .replace(/{curso}/g, empregado.nome.includes('João') ? 'Ciência da Computação' : 'Administração')
    .replace(/{rendimentos}/g, empregado.nome.includes('João') ? '102.000,00' : '78.000,00')
    .replace(/{irpf}/g, empregado.nome.includes('João') ? '15.300,00' : '11.700,00');
}

function criarArquivoPDF(conteudo, caminho) {
  // Criar um PDF simples com o conteúdo
  const pdfContent = `%PDF-1.4
1 0 obj
<<
/Type /Catalog
/Pages 2 0 R
>>
endobj

2 0 obj
<<
/Type /Pages
/Kids [3 0 R]
/Count 1
>>
endobj

3 0 obj
<<
/Type /Page
/Parent 2 0 R
/MediaBox [0 0 612 792]
/Contents 4 0 R
/Resources <<
/Font <<
/F1 5 0 R
>>
>>
>>
endobj

4 0 obj
<<
/Length ${conteudo.length + 100}
>>
stream
BT
/F1 12 Tf
72 720 Td
(${conteudo.replace(/[()\\]/g, '\\$&')}) Tj
ET
endstream
endobj

5 0 obj
<<
/Type /Font
/Subtype /Type1
/BaseFont /Helvetica
>>
endobj

xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000079 00000 n 
0000000136 00000 n 
0000000301 00000 n 
0000000510 00000 n 
trailer
<<
/Size 6
/Root 1 0 R
>>
startxref
${conteudo.length + 600}
%%EOF`;

  fs.writeFileSync(caminho, pdfContent);
}

function criarArquivoImagem(conteudo, caminho) {
  // Criar um arquivo de imagem simples (formato PPM)
  const largura = 800;
  const altura = 600;
  let ppm = `P3\n${largura} ${altura}\n255\n`;
  
  // Adicionar texto como pixels coloridos
  for (let y = 0; y < altura; y++) {
    for (let x = 0; x < largura; x++) {
      const r = Math.floor(Math.random() * 256);
      const g = Math.floor(Math.random() * 256);
      const b = Math.floor(Math.random() * 256);
      ppm += `${r} ${g} ${b} `;
    }
    ppm += '\n';
  }
  
  fs.writeFileSync(caminho, ppm);
}

async function criarArquivosEmpregado(empregado, uploadsDir) {
  console.log(`📄 Criando arquivos para ${empregado.nome}...`);
  
  const empregadoDir = path.join(uploadsDir, empregado.id.toString());
  if (!fs.existsSync(empregadoDir)) {
    fs.mkdirSync(empregadoDir, { recursive: true });
  }
  
  for (let i = 0; i < DOCUMENTOS.length; i++) {
    const doc = DOCUMENTOS[i];
    const nomeArquivo = `${doc.tipo.replace(/\s+/g, '_')}_${empregado.nome.replace(/\s+/g, '_')}.${doc.extensao}`;
    const caminhoArquivo = path.join(empregadoDir, nomeArquivo);
    
    const conteudo = gerarConteudoDocumento(doc, empregado, i);
    
    if (doc.extensao === 'pdf') {
      criarArquivoPDF(conteudo, caminhoArquivo);
    } else if (doc.extensao === 'jpg' || doc.extensao === 'png') {
      criarArquivoImagem(conteudo, caminhoArquivo);
    }
    
    console.log(`  ✅ ${nomeArquivo}`);
  }
}

async function main() {
  try {
    console.log('🚀 Criando arquivos de upload simulados...');
    
    const uploadsDir = criarDiretorioUploads();
    
    // Criar arquivos para cada empregado
    for (const empregado of EMPREGADOS) {
      await criarArquivosEmpregado(empregado, uploadsDir);
    }
    
    console.log('\n🎉 ARQUIVOS DE UPLOAD CRIADOS COM SUCESSO!');
    console.log(`📁 Diretório: ${uploadsDir}`);
    console.log(`📄 Total de arquivos: ${EMPREGADOS.length * DOCUMENTOS.length}`);
    
    console.log('\n📋 TIPOS DE DOCUMENTOS CRIADOS:');
    DOCUMENTOS.forEach(doc => {
      console.log(`  • ${doc.tipo} (.${doc.extensao})`);
    });
    
  } catch (error) {
    console.error('❌ Erro ao criar arquivos de upload:', error);
  }
}

main();
