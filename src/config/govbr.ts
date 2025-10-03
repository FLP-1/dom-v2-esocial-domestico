// Configuração do gov.br OAuth2
export interface GovBrConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  scope: string;
  authUrl: string;
  tokenUrl: string;
  apiUrl: string;
}

export const GOV_BR_CONFIG: GovBrConfig = {
  // Configurações do gov.br
  clientId: process.env.GOV_BR_CLIENT_ID || '',
  clientSecret: process.env.GOV_BR_CLIENT_SECRET || '',
  redirectUri: process.env.GOV_BR_REDIRECT_URI || 
    (process.env.NODE_ENV === 'production' 
      ? 'https://seu-dominio.com/api/esocial-real-govbr/callback'
      : 'http://localhost:3000/api/esocial-real-govbr/callback'),
  scope: 'openid profile email esocial:read',

  // URLs do gov.br (configuráveis via env)
  authUrl: process.env.GOV_BR_AUTH_URL || 'https://sso.acesso.gov.br/authorize',
  tokenUrl: process.env.GOV_BR_TOKEN_URL || 'https://sso.acesso.gov.br/token',

  // URL da API do eSocial (via gov.br)
  apiUrl: process.env.GOV_BR_API_URL || 
    (process.env.NODE_ENV === 'production'
      ? 'https://api.esocial.gov.br'
      : 'https://api-hom.esocial.gov.br'),
};

// Verificar se a configuração está completa
export function validateGovBrConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!GOV_BR_CONFIG.clientId) {
    errors.push('GOV_BR_CLIENT_ID não configurado');
  }

  if (!GOV_BR_CONFIG.clientSecret) {
    errors.push('GOV_BR_CLIENT_SECRET não configurado');
  }

  if (
    !GOV_BR_CONFIG.redirectUri ||
    GOV_BR_CONFIG.redirectUri.includes('localhost')
  ) {
    if (process.env.NODE_ENV === 'production') {
      errors.push('GOV_BR_REDIRECT_URI deve ser HTTPS em produção');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Gerar URL de autorização
export function generateAuthUrl(cpfCnpj: string, environment: string): string {
  const state = Buffer.from(
    JSON.stringify({
      cpfCnpj,
      environment,
      timestamp: Date.now(),
    })
  ).toString('base64');

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: GOV_BR_CONFIG.clientId,
    redirect_uri: GOV_BR_CONFIG.redirectUri,
    scope: GOV_BR_CONFIG.scope,
    state: state,
  });

  return `${GOV_BR_CONFIG.authUrl}?${params.toString()}`;
}

// Configurações por ambiente
export const ENVIRONMENT_CONFIG = {
  homologacao: {
    name: 'Homologação',
    apiUrl: 'https://api-hom.esocial.gov.br',
    description: 'Ambiente de testes do eSocial',
  },
  producao: {
    name: 'Produção',
    apiUrl: 'https://api.esocial.gov.br',
    description: 'Ambiente de produção do eSocial',
  },
};
