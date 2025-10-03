// 🎨 SISTEMA DE CORES ESSENCIAIS - APENAS 8 CORES!
// Sistema DOM - Máxima simplicidade e consistência

export const coresEssenciais = {
  // ========================================
  // CORES BASE (apenas 2)
  // ========================================
  base: {
    branco: '#FFFFFF',
    preto: '#000000',
  },

  // ========================================
  // CORES SEMÂNTICAS (apenas 4)
  // ========================================
  semantica: {
    sucesso: '#10B981',    // Verde - tudo positivo
    aviso: '#F59E0B',      // Amarelo - alertas
    erro: '#EF4444',       // Vermelho - problemas
    info: '#3B82F6',       // Azul - informações
  },

  // ========================================
  // CORES DE PERFIL (apenas 2)
  // ========================================
  perfis: {
    primario: '#29ABE2',   // Azul - perfil principal
    secundario: '#9B59B6', // Roxo - perfil secundário
  },
};

// ========================================
// MAPEAMENTO DE PERFIS PARA CORES
// ========================================
export const mapeamentoPerfis = {
  // Perfil Principal (Azul)
  empregado: coresEssenciais.perfis.primario,
  funcionario: coresEssenciais.perfis.primario,
  
  // Perfil Secundário (Roxo)  
  empregador: coresEssenciais.perfis.secundario,
  familia: coresEssenciais.perfis.secundario,
  admin: coresEssenciais.perfis.secundario,
  administrador: coresEssenciais.perfis.secundario,
  financeiro: coresEssenciais.perfis.secundario,
};

// ========================================
// FUNÇÕES SIMPLIFICADAS
// ========================================
export const obterCores = {
  // Cor do perfil (automática)
  perfil: (nomePerfil: string) => {
    const perfilLower = nomePerfil.toLowerCase();
    return mapeamentoPerfis[perfilLower as keyof typeof mapeamentoPerfis] || coresEssenciais.perfis.primario;
  },

  // Cor semântica
  semantica: (tipo: 'sucesso' | 'aviso' | 'erro' | 'info') => {
    return coresEssenciais.semantica[tipo];
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
// STATUS ULTRA-SIMPLIFICADOS
// ========================================
export const statusEssenciais = {
  pendente: coresEssenciais.semantica.aviso,    // Amarelo
  andamento: coresEssenciais.semantica.info,    // Azul  
  concluido: coresEssenciais.semantica.sucesso, // Verde
  erro: coresEssenciais.semantica.erro,         // Vermelho
};

// ========================================
// PRIORIDADES ULTRA-SIMPLIFICADAS
// ========================================
export const prioridadesEssenciais = {
  alta: coresEssenciais.semantica.erro,         // Vermelho
  media: coresEssenciais.semantica.aviso,       // Amarelo
  baixa: coresEssenciais.semantica.sucesso,     // Verde
};

// ========================================
// TEMA SIMPLIFICADO POR PERFIL
// ========================================
export const temaSimplificado = {
  // Tema padrão (para todos os perfis)
  padrao: {
    primaria: coresEssenciais.perfis.primario,
    secundaria: coresEssenciais.perfis.secundario,
    fundo: coresEssenciais.base.branco,
    superficie: '#F8F9FA',
    texto: '#1F2937',
    textoSecundario: '#6B7280',
    borda: '#E5E7EB',
    sucesso: coresEssenciais.semantica.sucesso,
    aviso: coresEssenciais.semantica.aviso,
    erro: coresEssenciais.semantica.erro,
    info: coresEssenciais.semantica.info,
  },
};

// ========================================
// HOOK SIMPLIFICADO
// ========================================
export const useTemaSimplificado = (perfilNome?: string) => {
  const tema = temaSimplificado.padrao;
  
  return {
    ...tema,
    primaria: perfilNome ? obterCores.perfil(perfilNome) : tema.primaria,
    fundoPerfil: perfilNome ? obterCores.fundoPerfil(perfilNome) : tema.superficie,
    bordaPerfil: perfilNome ? obterCores.bordaPerfil(perfilNome) : tema.borda,
    textoPerfil: perfilNome ? obterCores.textoPerfil(perfilNome) : tema.texto,
  };
};

export default coresEssenciais;
