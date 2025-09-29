// Configurações específicas para desabilitar warnings não-críticos em arquivos de demo
module.exports = {
  overrides: [
    {
      // Apenas arquivos de documentação (não código)
      files: ['docs/**/*.md'],
      rules: {
        // Desabilitar warnings de emojis em demos (não críticos)
        'jsx-a11y/accessible-emoji': 'off',
        // Desabilitar warnings de console.log em demos (para debug)
        'no-console': 'off',
        // Permitir CSS inline em demos e componentes complexos (para exemplos rápidos)
        'react/forbid-dom-props': 'off',
        // Desabilitar warnings de CSS inline para componentes com estilos dinâmicos
        'react/forbid-component-props': 'off',
        // Desabilitar warnings de select accessibility para componentes que já têm attrs
        'jsx-a11y/no-onchange': 'off',
      },
    },
    {
      // Arquivos de documentação
      files: ['docs/**/*.md'],
      rules: {
        // Desabilitar todas as regras de markdown não essenciais
        'MD040/fenced-code-language': 'off',
        'MD034/no-bare-urls': 'off',
        'MD024/no-duplicate-heading': 'off',
        'MD029/ol-prefix': 'off',
        'MD036/no-emphasis-as-heading': 'off',
      },
    },
  ],
};
