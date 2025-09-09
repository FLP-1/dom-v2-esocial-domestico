module.exports = {
  reactStrictMode: true,
  // Configurações para melhorar a navegação
  experimental: {
    // Forçar re-renderização em mudanças de rota
    scrollRestoration: true,
  },
  // Configurações de cache
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          {
            key: 'Expires',
            value: '0',
          },
        ],
      },
    ];
  },
};
