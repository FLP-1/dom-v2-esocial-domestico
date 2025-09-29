// EXEMPLO: Dados completos que serão extraídos quando protocolos processarem
console.log('📊 === EXEMPLO DE DADOS COMPLETOS DISPONÍVEIS ===');
console.log('✅ Quando protocolos estiverem processados (códigos 201/202/203)');
console.log('');

// Exemplo de dados que serão extraídos do S-1000 processado
const exemploEmpregadorCompleto = {
  tipo: 'EMPREGADOR',
  fonte: 'S1000_PROCESSADO',
  protocolo: '1.2.20250918.68606',

  // Dados básicos
  cpf: '59876913700',
  nome: 'FRANCISCO JOSE LATTARI PAPALEO',
  tipoInscricao: '1', // Pessoa Física
  classificacaoTributaria: '01',

  // Endereço completo
  endereco: {
    logradouro: 'RUA EXEMPLO REAL',
    numero: '123',
    complemento: 'CASA',
    bairro: 'CENTRO',
    cidade: 'SAO PAULO',
    uf: 'SP',
    cep: '01000000',
  },

  // Dados tributários
  indicadores: {
    optanteSimples: false,
    situacaoPF: 'ATIVO',
    contribuicaoSindical: true,
  },

  // Software House
  responsavelTecnico: {
    cpf: '00000000000',
    nome: 'RESPONSAVEL TECNICO',
    email: 'tecnico@empresa.com',
  },
};

// Exemplo de dados que serão extraídos do S-2200 processado
const exemploEmpregadoCompleto = {
  tipo: 'EMPREGADO',
  fonte: 'S2200_PROCESSADO',
  protocolo: '1.2.20250918.58742',

  // Dados pessoais REAIS para este empregador
  cpf: '38645446880',
  nome: 'ERIKA APARECIDA DOS SANTOS BARBOSA',
  dataNascimento: 'DATA_REAL_EXTRAIDA',
  sexo: 'F',
  estadoCivil: 'ESTADO_REAL_EXTRAIDO',

  // Dados trabalhistas ESPECÍFICOS para Francisco
  dataAdmissao: 'DATA_ADMISSAO_REAL_PARA_FRANCISCO',
  cargo: 'CARGO_REAL_PARA_FRANCISCO',
  codigoCargo: 'CODIGO_CBO_REAL',
  salario: 'SALARIO_REAL_PAGO_POR_FRANCISCO',

  // Vínculo específico
  vinculo: {
    tipo: 'CLT',
    categoria: 'EMPREGADO_DOMESTICO',
    regime: 'REGIME_GERAL_PREVIDENCIA',
    jornada: 'JORNADA_REAL_COM_FRANCISCO',
  },

  // Endereço onde trabalha (casa do Francisco)
  enderecoTrabalho: {
    logradouro: 'ENDERECO_REAL_FRANCISCO',
    numero: 'NUMERO_REAL',
    bairro: 'BAIRRO_REAL',
    cidade: 'CIDADE_REAL_TRABALHO',
    uf: 'UF_REAL',
  },

  // Documentos
  documentos: {
    ctps: {
      numero: 'CTPS_REAL',
      serie: 'SERIE_REAL',
      uf: 'UF_EMISSAO',
    },
    pis: 'PIS_REAL',
    tituloEleitor: 'TITULO_REAL',
  },
};

// Exemplo de dados adicionais via outras consultas
const exemploConsultasAdicionais = {
  // S-1200: Remuneração mensal
  remuneracaoMensal: {
    competencia: '2025-09',
    salarioBase: 'SALARIO_ATUAL_REAL',
    horasTrabalhadas: 'HORAS_REAIS_MES',
    adicionais: 'ADICIONAIS_REAIS',
    descontos: 'DESCONTOS_REAIS',
    salarioLiquido: 'LIQUIDO_REAL',
  },

  // S-2206: Alterações contratuais
  alteracoesContratuais: [
    {
      data: 'DATA_ALTERACAO',
      tipo: 'ALTERACAO_SALARIAL',
      valorAnterior: 'VALOR_ANTERIOR',
      valorNovo: 'VALOR_NOVO',
      motivo: 'MOTIVO_ALTERACAO',
    },
  ],

  // S-2230: Afastamentos
  afastamentos: [
    {
      dataInicio: 'DATA_INICIO_AFASTAMENTO',
      dataFim: 'DATA_FIM_AFASTAMENTO',
      motivo: 'MOTIVO_AFASTAMENTO',
      codigo: 'CODIGO_AFASTAMENTO',
    },
  ],

  // Histórico completo
  historicoCompleto: {
    admissoes: 'HISTORICO_ADMISSOES',
    alteracoes: 'HISTORICO_ALTERACOES',
    afastamentos: 'HISTORICO_AFASTAMENTOS',
    pagamentos: 'HISTORICO_PAGAMENTOS',
  },
};

console.log('🏢 DADOS COMPLETOS DO EMPREGADOR (quando processado):');
console.log(`📋 Nome: ${exemploEmpregadorCompleto.nome}`);
console.log(`🆔 CPF: ${exemploEmpregadorCompleto.cpf}`);
console.log(`📍 Endereço: Completo extraído do XML`);
console.log(
  `🏛️ Classificação: ${exemploEmpregadorCompleto.classificacaoTributaria}`
);
console.log(`👨‍💻 Responsável Técnico: Dados completos`);
console.log('');

console.log('👩‍💼 DADOS COMPLETOS DO EMPREGADO (quando processado):');
console.log(`📋 Nome: ${exemploEmpregadoCompleto.nome}`);
console.log(`🆔 CPF: ${exemploEmpregadoCompleto.cpf}`);
console.log(`📅 Data Admissão: ${exemploEmpregadoCompleto.dataAdmissao}`);
console.log(`👔 Cargo: ${exemploEmpregadoCompleto.cargo}`);
console.log(`💰 Salário: ${exemploEmpregadoCompleto.salario}`);
console.log(`🏠 Endereço Trabalho: Dados completos da casa do Francisco`);
console.log(`📋 Documentos: CTPS, PIS, Título - todos reais`);
console.log('');

console.log('📊 CONSULTAS ADICIONAIS DISPONÍVEIS:');
console.log(
  `💰 Remuneração: ${exemploConsultasAdicionais.remuneracaoMensal.competencia}`
);
console.log(
  `📝 Alterações: ${exemploConsultasAdicionais.alteracoesContratuais.length} registros`
);
console.log(
  `🏥 Afastamentos: ${exemploConsultasAdicionais.afastamentos.length} registros`
);
console.log(`📈 Histórico: Completo desde admissão`);
console.log('');

console.log('🎯 === DIFERENÇA FUNDAMENTAL ===');
console.log('');
console.log('❌ ANTES (dados incorretos):');
console.log('   • Dados de OUTROS empregadores da Erika');
console.log('   • Informações genéricas ou de exemplo');
console.log('   • Não específicos para Francisco');
console.log('');
console.log('✅ DEPOIS (quando processado):');
console.log('   • Dados ESPECÍFICOS da Erika PARA Francisco');
console.log('   • Informações REAIS extraídas do eSocial');
console.log('   • Vínculo trabalhista específico');
console.log('   • Endereço de trabalho (casa do Francisco)');
console.log('   • Salário REAL pago por Francisco');
console.log('   • Data admissão REAL com Francisco');
console.log('');

console.log('⏰ STATUS ATUAL:');
console.log('🔍 Aguardando processamento dos protocolos (código 748)');
console.log('📊 Quando processar: Todos estes dados estarão disponíveis');
console.log('🎯 Resolverá definitivamente a questão dos dados específicos');
console.log('');

console.log('💡 PRÓXIMOS PASSOS:');
console.log('1. ⏰ Aguardar mais 30-60 min');
console.log('2. 🔍 Verificar novamente o processamento');
console.log('3. ✅ Extrair dados completos quando códigos = 201/202/203');
console.log('4. 📊 Apresentar informações REAIS e específicas');
console.log('');

console.log('🎉 CONCLUSÃO:');
console.log('✅ Sistema preparado para extrair dados completos');
console.log('✅ Métodos implementados e funcionais');
console.log('⏰ Aguardando apenas processamento dos protocolos');
console.log('🎯 Dados específicos da Erika PARA Francisco em breve!');
