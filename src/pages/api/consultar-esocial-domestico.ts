import { NextApiRequest, NextApiResponse } from 'next';
import { ESocialSoapReal } from '../../services/esocialSoapReal';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res
      .status(405)
      .json({ success: false, error: 'Método não permitido' });
  }

  try {
    const { cpf = '59876913700', ambiente = 'producao' } = req.body;

    const config = {
      environment: ambiente as 'producao' | 'homologacao',
      companyId: cpf,
    };

    const soapService = new ESocialSoapReal(config);

    // Carregar certificado
    const fs = require('fs');
    const path = require('path');
    const certPath = path.join(
      process.cwd(),
      'public',
      'certificates',
      'eCPF A1 24940271 (senha 456587).pfx'
    );

    if (fs.existsSync(certPath)) {
      const certBuffer = fs.readFileSync(certPath);
      await soapService.loadCertificate(certBuffer, '456587');
    }

    // 1. CONSULTAR CADASTRO DO EMPREGADOR
    console.log('🔍 Consultando cadastro do empregador...');
    const consultaEmpregador = await soapService.consultarEmpregador(cpf);

    // 2. CONSULTAR TRABALHADORES CADASTRADOS
    console.log('👥 Consultando trabalhadores cadastrados...');
    const consultaTrabalhadores = await soapService.consultarTrabalhadores(cpf);

    // 3. CONSULTAR EVENTOS ENVIADOS
    console.log('📋 Consultando eventos enviados...');
    const consultaEventos = await soapService.consultarEventos(cpf);

    // 4. CONSULTAR STATUS DE LOTES
    console.log('📊 Consultando status de lotes...');
    const consultaLotes = await soapService.consultarLotes(cpf);

    const resultado = {
      empregador: {
        cpf: cpf,
        cadastro: consultaEmpregador,
        status: consultaEmpregador.success ? 'CADASTRADO' : 'NÃO CADASTRADO',
      },
      trabalhadores: {
        total: consultaTrabalhadores.success
          ? consultaTrabalhadores.data?.length || 0
          : 0,
        dados: consultaTrabalhadores.data || [],
        status: consultaTrabalhadores.success
          ? 'ENCONTRADOS'
          : 'NÃO ENCONTRADOS',
      },
      eventos: {
        total: consultaEventos.success ? consultaEventos.data?.length || 0 : 0,
        dados: consultaEventos.data || [],
        status: consultaEventos.success ? 'ENCONTRADOS' : 'NÃO ENCONTRADOS',
      },
      lotes: {
        total: consultaLotes.success ? consultaLotes.data?.length || 0 : 0,
        dados: consultaLotes.data || [],
        status: consultaLotes.success ? 'ENCONTRADOS' : 'NÃO ENCONTRADOS',
      },
      resumo: {
        empregador_cadastrado: consultaEmpregador.success,
        tem_trabalhadores:
          consultaTrabalhadores.success &&
          (consultaTrabalhadores.data?.length || 0) > 0,
        tem_eventos:
          consultaEventos.success && (consultaEventos.data?.length || 0) > 0,
        tem_lotes:
          consultaLotes.success && (consultaLotes.data?.length || 0) > 0,
        ambiente: ambiente,
        timestamp: new Date().toISOString(),
      },
    };

    return res.status(200).json({
      success: true,
      data: resultado,
      message: 'Consulta completa do eSocial Doméstico realizada',
    });
  } catch (error) {
    console.error('❌ Erro na consulta do eSocial Doméstico:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro na consulta do eSocial Doméstico',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
    });
  }
}
