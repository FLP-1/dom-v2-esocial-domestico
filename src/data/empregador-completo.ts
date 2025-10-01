// Dados completos do empregador para cadastro no eSocial
export const EMPREGADOR_COMPLETO = {
  // Identificação do Empregador
  ideEmpregador: {
    tpInsc: 2, // 2 = CPF
    nrInsc: '59876913700',
  },

  // Dados do Empregador
  dadosEmpregador: {
    // Informações básicas
    nmRazao: 'FLP Business Strategy',
    classTrib: '01', // 01 = Microempresa
    natJurid: '2135', // 2135 = Empresa Individual de Responsabilidade Limitada
    indCoop: '0', // 0 = Não é cooperativa
    indConstr: '0', // 0 = Não é construtora
    indDesFolha: '0', // 0 = Não desconta folha
    indOptRegEletron: '0', // 0 = Não optou pelo registro eletrônico
    indEntEd: 'N', // N = Não é entidade educativa
    indEtt: 'N', // N = Não é ETT
    nrRegEtt: null, // Número do registro ETT (se aplicável)
    indSituacaoPJ: '1', // 1 = Ativa
    indUnif: '0', // 0 = Não é unificada
    indTetoRemun: 'N', // N = Não tem teto remuneratório
    indComercializacao: '0', // 0 = Não comercializa
    indDesoneracao: '0', // 0 = Não tem desoneração
    indAcordoIsenMulta: 'N', // N = Não tem acordo de isenção de multa
    indSitPJ: '0', // 0 = Situação normal
    indApuracao: '1', // 1 = Apuração mensal
    indTrabTemporario: 'N', // N = Não é trabalho temporário
  },

  // Endereço do Empregador
  endereco: {
    nmLograd: 'Rua das Flores',
    nrLograd: '123',
    complemento: 'Sala 45',
    bairro: 'Centro',
    cep: '01234567',
    codMunic: '3550308', // Código do município de São Paulo
    uf: 'SP',
    pais: '105', // 105 = Brasil
    indEndereco: '1', // 1 = Endereço principal
  },

  // Contato do Empregador
  contato: {
    fonePrinc: '11999999999',
    foneAlternat: null,
    emailPrinc: 'contato@flpbusiness.com',
    emailAlternat: null,
  },

  // Software House (se aplicável)
  softwareHouse: {
    cnpjSoftHouse: null,
    nmRazao: null,
    nmCont: null,
    telefone: null,
    email: null,
  },

  // Informações complementares
  infoComplementares: {
    situacaoPJ: '1', // 1 = Ativa
    situacaoPF: '1', // 1 = Ativa
    classTrib: '01', // 01 = Microempresa
    natJurid: '2135', // 2135 = Empresa Individual de Responsabilidade Limitada
    inicioValid: '2025-01-01', // Data de início da validade
    fimValid: null, // Data de fim da validade (se aplicável)
  },

  // Dados do responsável
  responsavel: {
    cpfResp: '59876913700',
    nmResp: 'FRANCISCO JOSE LATTARI PAPALEO',
    telefone: '11999999999',
    email: 'contato@flpbusiness.com',
  },

  // Informações fiscais
  infoFiscal: {
    indApuracao: '1', // 1 = Apuração mensal
    indTetoRemun: 'N', // N = Não tem teto remuneratório
    indComercializacao: '0', // 0 = Não comercializa
    indDesoneracao: '0', // 0 = Não tem desoneração
    indAcordoIsenMulta: 'N', // N = Não tem acordo de isenção de multa
    indSitPJ: '0', // 0 = Situação normal
  },

  // Dados do empregado (mínimo 1 empregado necessário)
  empregados: [
    {
      cpfTrab: '12345678901', // CPF do empregado (exemplo)
      nmTrab: 'João da Silva',
      sexo: 'M',
      racaCor: '1', // 1 = Branca
      estCiv: '1', // 1 = Solteiro
      grauInstr: '08', // 08 = Ensino médio completo
      nmSoc: 'João da Silva',
      dtNascto: '1990-01-01',
      codMunicNascto: '3550308', // São Paulo
      ufNascto: 'SP',
      paisNascto: '105', // Brasil
      nmMae: 'Maria da Silva',
      nmPai: 'José da Silva',
      endereco: {
        nmLograd: 'Rua das Palmeiras',
        nrLograd: '456',
        complemento: 'Apto 12',
        bairro: 'Vila Nova',
        cep: '01234567',
        codMunic: '3550308',
        uf: 'SP',
        pais: '105',
      },
      trabEstrangeiro: {
        dtChegada: null,
        classTrabEstrang: null,
        casadoBr: 'N',
        filhosBr: 'N',
      },
      infoDeficiencia: {
        defFisica: 'N',
        defVisual: 'N',
        defAuditiva: 'N',
        defMental: 'N',
        defIntelectual: 'N',
        reabReadap: 'N',
        infoCota: 'N',
        observacao: null,
      },
      dependente: [],
      contato: {
        fonePrinc: '11988888888',
        foneAlternat: null,
        emailPrinc: 'joao@email.com',
        emailAlternat: null,
      },
      infoTrabCedido: {
        cnpjCednt: null,
        matricCed: null,
        dtAdmCed: null,
        categOrig: null,
        cnpjCession: null,
        matricCession: null,
        dtAdmCession: null,
        categCession: null,
        observacao: null,
      },
      infoEstagiario: {
        natEstagio: null,
        nivEstagio: null,
        areaAtuacao: null,
        nrApol: null,
        dtPrevTerm: null,
        instEnsino: {
          cnpjInstEnsino: null,
          nmRazao: null,
          dscLograd: null,
          nrLograd: null,
          bairro: null,
          cep: null,
          codMunic: null,
          uf: null,
        },
        ageIntegracao: {
          cnpjAgntInteg: null,
          nmRazao: null,
          dscLograd: null,
          nrLograd: null,
          bairro: null,
          cep: null,
          codMunic: null,
          uf: null,
        },
        supervisorEstagio: {
          cpfSupervisor: null,
          nmSuperv: null,
        },
      },
      infoComplementares: {
        cargoFuncao: {
          codCargo: '001',
          nmCargo: 'Assistente Administrativo',
          codFuncao: null,
        },
      },
    },
  ],
};

// Validação dos dados
export const validateEmpregadorData = () => {
  const errors: string[] = [];

  // Validar CPF
  if (
    !EMPREGADOR_COMPLETO.ideEmpregador.nrInsc ||
    EMPREGADOR_COMPLETO.ideEmpregador.nrInsc.length !== 11
  ) {
    errors.push('CPF inválido');
  }

  // Validar nome
  if (!EMPREGADOR_COMPLETO.dadosEmpregador.nmRazao) {
    errors.push('Nome da empresa é obrigatório');
  }

  // Validar endereço
  if (!EMPREGADOR_COMPLETO.endereco.nmLograd) {
    errors.push('Logradouro é obrigatório');
  }

  if (
    !EMPREGADOR_COMPLETO.endereco.cep ||
    EMPREGADOR_COMPLETO.endereco.cep.length !== 8
  ) {
    errors.push('CEP inválido');
  }

  // Validar contato
  if (!EMPREGADOR_COMPLETO.contato.fonePrinc) {
    errors.push('Telefone principal é obrigatório');
  }

  if (!EMPREGADOR_COMPLETO.contato.emailPrinc) {
    errors.push('Email principal é obrigatório');
  }

  // Validar empregados
  if (
    !EMPREGADOR_COMPLETO.empregados ||
    EMPREGADOR_COMPLETO.empregados.length === 0
  ) {
    errors.push('Pelo menos um empregado é obrigatório');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};
