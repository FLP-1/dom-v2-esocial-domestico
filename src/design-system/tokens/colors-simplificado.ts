// 🎨 SISTEMA DE CORES SIMPLIFICADO
// Apenas as cores ESSENCIAIS para o sistema DOM

export const coresSimplificadas = {
  // ========================================
  // CORES BASE (apenas 4)
  // ========================================
  base: {
    branco: '#FFFFFF',
    preto: '#000000',
    cinza: '#6B7280',
    transparente: 'transparent',
  },

  // ========================================
  // CORES SEMÂNTICAS (apenas 4)
  // ========================================
  semantica: {
    sucesso: '#10B981',    // Verde - para tudo que é positivo
    aviso: '#F59E0B',      // Amarelo - para alertas
    erro: '#EF4444',       // Vermelho - para problemas
    info: '#3B82F6',       // Azul - para informações
  },

  // ========================================
  // CORES DE PERFIL (apenas 1 cor por perfil)
  // ========================================
  perfis: {
    empregado: '#29ABE2',   // Azul
    empregador: '#E74C3C',  // Vermelho
    familia: '#9B59B6',     // Roxo
    admin: '#34495E',       // Cinza escuro
  },

  // ========================================
  // TONS DE CINZA (apenas 5)
  // ========================================
  cinza: {
    claro: '#F9FAFB',       // Backgrounds
    medio: '#E5E7EB',       // Bordas
    escuro: '#374151',      // Texto secundário
    maisEscuro: '#1F2937',  // Texto principal
    maisEscuroAinda: '#111827', // Texto crítico
  },
};

// ========================================
// FUNÇÃO PARA OBTER CORES
// ========================================
export const obterCores = {
  // Cor do perfil
  perfil: (nomePerfil: string) => {
    return coresSimplificadas.perfis[nomePerfil as keyof typeof coresSimplificadas.perfis] || coresSimplificadas.perfis.empregado;
  },

  // Cor semântica
  semantica: (tipo: 'sucesso' | 'aviso' | 'erro' | 'info') => {
    return coresSimplificadas.semantica[tipo];
  },

  // Cor de fundo baseada no perfil (versão clara)
  fundoPerfil: (nomePerfil: string) => {
    const cor = obterCores.perfil(nomePerfil);
    return `${cor}10`; // Adiciona transparência
  },

  // Cor de borda baseada no perfil (versão média)
  bordaPerfil: (nomePerfil: string) => {
    const cor = obterCores.perfil(nomePerfil);
    return `${cor}40`; // Adiciona transparência
  },
};

// ========================================
// TEMAS SIMPLIFICADOS
// ========================================
export const temasSimplificados = {
  empregado: {
    primaria: coresSimplificadas.perfis.empregado,
    secundaria: coresSimplificadas.cinza.medio,
    fundo: coresSimplificadas.base.branco,
    superficie: coresSimplificadas.cinza.claro,
    texto: coresSimplificadas.cinza.maisEscuro,
    textoSecundario: coresSimplificadas.cinza.escuro,
    borda: coresSimplificadas.cinza.medio,
  },
  empregador: {
    primaria: coresSimplificadas.perfis.empregador,
    secundaria: coresSimplificadas.cinza.medio,
    fundo: coresSimplificadas.base.branco,
    superficie: '#FDF2F2', // Versão clara do vermelho
    texto: coresSimplificadas.cinza.maisEscuro,
    textoSecundario: coresSimplificadas.cinza.escuro,
    borda: '#FADBD8', // Versão clara do vermelho
  },
  familia: {
    primaria: coresSimplificadas.perfis.familia,
    secundaria: coresSimplificadas.cinza.medio,
    fundo: coresSimplificadas.base.branco,
    superficie: '#F3E5F5', // Versão clara do roxo
    texto: coresSimplificadas.cinza.maisEscuro,
    textoSecundario: coresSimplificadas.cinza.escuro,
    borda: '#E1BEE7', // Versão clara do roxo
  },
  admin: {
    primaria: coresSimplificadas.perfis.admin,
    secundaria: coresSimplificadas.cinza.medio,
    fundo: coresSimplificadas.base.branco,
    superficie: coresSimplificadas.cinza.claro,
    texto: coresSimplificadas.cinza.maisEscuro,
    textoSecundario: coresSimplificadas.cinza.escuro,
    borda: coresSimplificadas.cinza.medio,
  },
};

// ========================================
// STATUS SIMPLIFICADOS (usando cores semânticas)
// ========================================
export const statusSimplificados = {
  pendente: coresSimplificadas.semantica.aviso,    // Amarelo
  andamento: coresSimplificadas.semantica.info,    // Azul
  concluido: coresSimplificadas.semantica.sucesso, // Verde
  erro: coresSimplificadas.semantica.erro,         // Vermelho
};

// ========================================
// PRIORIDADES SIMPLIFICADAS (usando cores semânticas)
// ========================================
export const prioridadesSimplificadas = {
  alta: coresSimplificadas.semantica.erro,         // Vermelho
  media: coresSimplificadas.semantica.aviso,       // Amarelo
  baixa: coresSimplificadas.semantica.sucesso,     // Verde
};

export default coresSimplificadas;
