// 🎨 SISTEMA DE CORES EQUILIBRADO
// 7 cores de perfil + 3 tons de cinza + 4 cores semânticas = 14 cores total

export const coresEquilibradas = {
  // ========================================
  // CORES DE PERFIL (7 cores - uma para cada tipo)
  // ========================================
  perfis: {
    empregado: '#29ABE2',     // Azul - trabalhador principal
    empregador: '#2E8B57',    // Verde escuro - patrão (evita conflito com erro)
    familia: '#9B59B6',       // Roxo - família
    admin: '#6B7280',         // Cinza médio - administrador técnico
    funcionario: '#4682B4',   // Azul acinzentado - colaborador
    financeiro: '#FF6347',    // Laranja - responsável financeiro
    administrador: '#8B008B', // Roxo escuro - DONO/IDEALIZADOR do projeto
  },

  // ========================================
  // TONS DE CINZA BASE (3 tons essenciais)
  // ========================================
  cinza: {
    claro: '#F8F9FA',         // Fundos e superfícies
    medio: '#6B7280',         // Texto secundário e bordas
    escuro: '#1F2937',        // Texto principal
  },

  // ========================================
  // CORES SEMÂNTICAS (4 cores para status)
  // ========================================
  semantica: {
    sucesso: '#10B981',       // Verde - sucesso
    aviso: '#F59E0B',         // Amarelo - avisos
    erro: '#EF4444',          // Vermelho - erros
    info: '#3B82F6',          // Azul - informações
  },

  // ========================================
  // CORES BASE
  // ========================================
  base: {
    branco: '#FFFFFF',
    preto: '#000000',
  },
};

// ========================================
// FUNÇÕES PARA OBTER CORES
// ========================================
export const obterCores = {
  // Cor do perfil específico
  perfil: (nomePerfil: string) => {
    const perfilLower = nomePerfil.toLowerCase();
    return coresEquilibradas.perfis[perfilLower as keyof typeof coresEquilibradas.perfis] || coresEquilibradas.perfis.empregado;
  },

  // Cor semântica
  semantica: (tipo: 'sucesso' | 'aviso' | 'erro' | 'info') => {
    return coresEquilibradas.semantica[tipo];
  },

  // Tons de cinza
  cinza: (tonalidade: 'claro' | 'medio' | 'escuro') => {
    return coresEquilibradas.cinza[tonalidade];
  },

  // Fundo baseado no perfil (versão clara)
  fundoPerfil: (nomePerfil: string) => {
    const cor = obterCores.perfil(nomePerfil);
    return `${cor}10`; // 10% de opacidade
  },

  // Borda baseada no perfil (versão média)
  bordaPerfil: (nomePerfil: string) => {
    const cor = obterCores.perfil(nomePerfil);
    return `${cor}40`; // 40% de opacidade
  },

  // Texto baseado no perfil (versão escura)
  textoPerfil: (nomePerfil: string) => {
    const cor = obterCores.perfil(nomePerfil);
    return `${cor}90`; // 90% de opacidade
  },
};

// ========================================
// STATUS SIMPLIFICADOS (usando cores semânticas)
// ========================================
export const statusEquilibrados = {
  pendente: coresEquilibradas.semantica.aviso,    // Amarelo
  andamento: coresEquilibradas.semantica.info,    // Azul
  concluido: coresEquilibradas.semantica.sucesso, // Verde
  erro: coresEquilibradas.semantica.erro,         // Vermelho
};

// ========================================
// PRIORIDADES SIMPLIFICADAS
// ========================================
export const prioridadesEquilibradas = {
  alta: coresEquilibradas.semantica.erro,         // Vermelho
  media: coresEquilibradas.semantica.aviso,       // Amarelo
  baixa: coresEquilibradas.semantica.sucesso,     // Verde
};

// ========================================
// TEMA COMPLETO POR PERFIL
// ========================================
export const temasPorPerfil = {
  empregado: {
    primaria: coresEquilibradas.perfis.empregado,
    secundaria: coresEquilibradas.cinza.medio,
    fundo: coresEquilibradas.base.branco,
    superficie: coresEquilibradas.cinza.claro,
    texto: coresEquilibradas.cinza.escuro,
    textoSecundario: coresEquilibradas.cinza.medio,
    borda: coresEquilibradas.cinza.claro,
  },
  empregador: {
    primaria: coresEquilibradas.perfis.empregador,
    secundaria: coresEquilibradas.cinza.medio,
    fundo: coresEquilibradas.base.branco,
    superficie: '#F0F8F0', // Versão clara do verde escuro
    texto: coresEquilibradas.cinza.escuro,
    textoSecundario: coresEquilibradas.cinza.medio,
    borda: '#D4E6D4', // Versão clara do verde escuro
  },
  familia: {
    primaria: coresEquilibradas.perfis.familia,
    secundaria: coresEquilibradas.cinza.medio,
    fundo: coresEquilibradas.base.branco,
    superficie: '#F3E5F5', // Versão clara do roxo
    texto: coresEquilibradas.cinza.escuro,
    textoSecundario: coresEquilibradas.cinza.medio,
    borda: '#E1BEE7', // Versão clara do roxo
  },
  admin: {
    primaria: coresEquilibradas.perfis.admin,
    secundaria: coresEquilibradas.cinza.medio,
    fundo: coresEquilibradas.base.branco,
    superficie: coresEquilibradas.cinza.claro,
    texto: coresEquilibradas.cinza.escuro,
    textoSecundario: coresEquilibradas.cinza.medio,
    borda: coresEquilibradas.cinza.medio,
  },
  funcionario: {
    primaria: coresEquilibradas.perfis.funcionario,
    secundaria: coresEquilibradas.cinza.medio,
    fundo: coresEquilibradas.base.branco,
    superficie: '#E6F3FF', // Versão clara do azul acinzentado
    texto: coresEquilibradas.cinza.escuro,
    textoSecundario: coresEquilibradas.cinza.medio,
    borda: '#B3D9FF', // Versão clara do azul acinzentado
  },
  financeiro: {
    primaria: coresEquilibradas.perfis.financeiro,
    secundaria: coresEquilibradas.cinza.medio,
    fundo: coresEquilibradas.base.branco,
    superficie: '#FFF4F0', // Versão clara do laranja
    texto: coresEquilibradas.cinza.escuro,
    textoSecundario: coresEquilibradas.cinza.medio,
    borda: '#FFE0D6', // Versão clara do laranja
  },
  administrador: {
    primaria: coresEquilibradas.perfis.administrador,
    secundaria: coresEquilibradas.cinza.medio,
    fundo: coresEquilibradas.base.branco,
    superficie: '#F5F0F5', // Versão clara do roxo escuro
    texto: coresEquilibradas.cinza.escuro,
    textoSecundario: coresEquilibradas.cinza.medio,
    borda: '#E6D9E6', // Versão clara do roxo escuro
  },
};

// ========================================
// HOOK PARA USAR TEMA
// ========================================
export const useTemaEquilibrado = (perfilNome?: string) => {
  const perfil = perfilNome?.toLowerCase() as keyof typeof temasPorPerfil;
  const tema = perfil && temasPorPerfil[perfil] ? temasPorPerfil[perfil] : temasPorPerfil.empregado;
  
  return {
    ...tema,
    // Cores semânticas sempre disponíveis
    sucesso: coresEquilibradas.semantica.sucesso,
    aviso: coresEquilibradas.semantica.aviso,
    erro: coresEquilibradas.semantica.erro,
    info: coresEquilibradas.semantica.info,
  };
};

// ========================================
// UTILITÁRIOS
// ========================================
export const cores = {
  // Lista todos os perfis disponíveis
  listarPerfis: () => Object.keys(coresEquilibradas.perfis),
  
  // Verifica se um perfil existe
  perfilExiste: (nome: string) => nome.toLowerCase() in coresEquilibradas.perfis,
  
  // Obtém cor com fallback
  obterComFallback: (perfil: string, fallback: string = coresEquilibradas.perfis.empregado) => {
    return obterCores.perfil(perfil) || fallback;
  },
};

export default coresEquilibradas;
