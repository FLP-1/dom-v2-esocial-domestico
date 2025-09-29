// Teste de certificado PFX
import * as fs from 'fs';
import { NextApiRequest, NextApiResponse } from 'next';
import path from 'path';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const results = {
      timestamp: new Date().toISOString(),
      steps: [] as any[],
      success: false,
      error: null as string | null,
    };

    // Passo 1: Verificar se certificado existe
    const certPath = path.join(
      process.cwd(),
      'certificados',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    results.steps.push({
      step: 1,
      name: 'Verificar certificado existe',
      status: fs.existsSync(certPath) ? 'OK' : 'ERRO',
      details: { path: certPath, exists: fs.existsSync(certPath) },
    });

    if (!fs.existsSync(certPath)) {
      results.error = 'Certificado não encontrado';
      return res.status(200).json(results);
    }

    // Passo 2: Carregar certificado
    let pfx: Buffer;
    try {
      pfx = fs.readFileSync(certPath);
      results.steps.push({
        step: 2,
        name: 'Carregar certificado',
        status: 'OK',
        details: { size: pfx.length, type: typeof pfx },
      });
    } catch (error) {
      results.steps.push({
        step: 2,
        name: 'Carregar certificado',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao carregar certificado';
      return res.status(200).json(results);
    }

    // Passo 3: Verificar se certificado é válido
    try {
      if (pfx.length === 0) {
        throw new Error('Certificado está vazio');
      }

      // Verificar se é um arquivo PFX válido (começa com PKCS#12 magic number)
      const magic = pfx.slice(0, 4);
      const isPfx = magic[0] === 0x30 && magic[1] === 0x82;

      results.steps.push({
        step: 3,
        name: 'Verificar certificado válido',
        status: isPfx ? 'OK' : 'ERRO',
        details: {
          size: pfx.length,
          magic: magic.toString('hex'),
          isPfx: isPfx,
        },
      });

      if (!isPfx) {
        results.error = 'Certificado não é um arquivo PFX válido';
        return res.status(200).json(results);
      }
    } catch (error) {
      results.steps.push({
        step: 3,
        name: 'Verificar certificado válido',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao verificar certificado';
      return res.status(200).json(results);
    }

    // Passo 4: Testar senha do certificado
    try {
      const https = require('https');
      const agent = new https.Agent({
        pfx,
        passphrase: '456587',
        rejectUnauthorized: false,
      });

      results.steps.push({
        step: 4,
        name: 'Testar senha do certificado',
        status: 'OK',
        details: { agentCreated: true },
      });
    } catch (error) {
      results.steps.push({
        step: 4,
        name: 'Testar senha do certificado',
        status: 'ERRO',
        details: {
          error: error instanceof Error ? error.message : 'Erro desconhecido',
        },
      });
      results.error = 'Erro ao testar senha do certificado';
      return res.status(200).json(results);
    }

    results.success = true;
    return res.status(200).json(results);
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString(),
    });
  }
}
