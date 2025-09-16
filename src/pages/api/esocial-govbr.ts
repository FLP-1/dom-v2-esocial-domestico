// API para acesso ao eSocial via gov.br (OAuth2)
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { action, cpfCnpj, environment = 'homologacao' } = req.body;

    if (!action || !cpfCnpj) {
      return res.status(400).json({
        error: 'Parâmetros obrigatórios: action, cpfCnpj',
        actions: ['getAuthUrl', 'exchangeToken', 'consultarEmpregador'],
      });
    }

    const results = {
      timestamp: new Date().toISOString(),
      action,
      cpfCnpj,
      environment,
      success: false,
      data: null as any,
      error: null as string | null,
    };

    switch (action) {
      case 'getAuthUrl':
        results.data = getAuthUrl(cpfCnpj, environment);
        results.success = true;
        break;
      case 'exchangeToken':
        results.data = await exchangeToken(req.body.code, req.body.state);
        results.success = true;
        break;
      case 'consultarEmpregador':
        results.data = await consultarEmpregadorViaGovBr(
          cpfCnpj,
          environment,
          req.body.accessToken
        );
        results.success = true;
        break;
      default:
        return res.status(400).json({
          error: 'Ação não suportada',
          supportedActions: [
            'getAuthUrl',
            'exchangeToken',
            'consultarEmpregador',
          ],
        });
    }

    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}

// Gerar URL de autorização OAuth2
function getAuthUrl(cpfCnpj: string, environment: string) {
  const clientId = process.env.GOV_BR_CLIENT_ID || 'SEU_CLIENT_ID_AQUI';
  const redirectUri =
    process.env.GOV_BR_REDIRECT_URI ||
    'http://localhost:3000/api/esocial-govbr/callback';
  const state = Buffer.from(JSON.stringify({ cpfCnpj, environment })).toString(
    'base64'
  );

  const authUrl = new URL('https://sso.acesso.gov.br/authorize');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('client_id', clientId);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('scope', 'openid profile email');
  authUrl.searchParams.set('state', state);

  return {
    authUrl: authUrl.toString(),
    instructions: [
      '1. Acesse a URL de autorização acima',
      '2. Faça login com sua conta gov.br (nível ouro ou prata)',
      '3. Autorize o acesso ao eSocial',
      '4. Copie o código de autorização retornado',
      '5. Use o endpoint /api/esocial-govbr com action=exchangeToken',
    ],
    requirements: [
      'Conta gov.br nível ouro ou prata',
      'Aplicação registrada no gov.br',
      'Client ID configurado',
      'Redirect URI configurado',
    ],
  };
}

// Trocar código de autorização por token de acesso
async function exchangeToken(code: string, state: string) {
  const clientId = process.env.GOV_BR_CLIENT_ID || 'SEU_CLIENT_ID_AQUI';
  const clientSecret =
    process.env.GOV_BR_CLIENT_SECRET || 'SEU_CLIENT_SECRET_AQUI';
  const redirectUri =
    process.env.GOV_BR_REDIRECT_URI ||
    'http://localhost:3000/api/esocial-govbr/callback';

  const tokenUrl = 'https://sso.acesso.gov.br/token';
  const tokenData = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    client_id: clientId,
    client_secret: clientSecret,
  });

  try {
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenData.toString(),
    });

    if (!response.ok) {
      throw new Error(
        `Erro ao trocar token: ${response.status} ${response.statusText}`
      );
    }

    const tokenResponse = await response.json();

    return {
      accessToken: tokenResponse.access_token,
      tokenType: tokenResponse.token_type,
      expiresIn: tokenResponse.expires_in,
      scope: tokenResponse.scope,
      state: state,
    };
  } catch (error) {
    throw new Error(
      `Erro ao trocar código por token: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}

// Consultar empregador via gov.br
async function consultarEmpregadorViaGovBr(
  cpfCnpj: string,
  environment: string,
  accessToken: string
) {
  // URL da API do eSocial via gov.br
  const apiUrl =
    environment === 'homologacao'
      ? 'https://api-hom.esocial.gov.br/empregador/consultar'
      : 'https://api.esocial.gov.br/empregador/consultar';

  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cpfCnpj: cpfCnpj.replace(/\D/g, ''),
        ambiente: environment,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Erro na API do eSocial: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      method: 'GOV_BR_OAUTH2',
      success: true,
      data: data,
      source: 'ESOCIAL_REAL',
    };
  } catch (error) {
    throw new Error(
      `Erro ao consultar empregador via gov.br: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    );
  }
}
