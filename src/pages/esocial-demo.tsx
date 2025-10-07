import { GetServerSideProps } from 'next';
import { useState } from 'react';
import { Label, Select, Input } from '../components/FormComponents';
import { UnifiedButton } from '../components/UnifiedButton';
import { useTheme } from '../hooks/useTheme';

interface DemoResult {
  success: boolean;
  data?: any;
  error?: string;
}

interface ESocialDemoProps {
  initialData?: DemoResult;
}

export default function ESocialDemo({ initialData }: ESocialDemoProps) {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoResult | null>(initialData || null);
  const [cpf, setCpf] = useState('');
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>(
    'producao'
  );

  const executarTeste = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/diagnostico-esocial', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf,
          ambiente,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: `Erro na requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const executarCadastramento = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/cadastrar-com-protocolos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cpf,
          ambiente,
        }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: `Erro na requisição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sucesso':
        return 'text-green-600 bg-green-100';
      case 'erro':
        return 'text-red-600 bg-red-100';
      case 'aviso':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sucesso':
        return '✅';
      case 'erro':
        return '❌';
      case 'aviso':
        return '⚠️';
      default:
        return '⏳';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            <span role='img' aria-label='Alvo'>
              🎯
            </span>{' '}
            eSocial - Demonstração Funcional
          </h1>
          <p className='text-xl text-gray-600'>
            Sistema de integração com eSocial funcionando com novos endpoints
          </p>
          <div className='mt-4 p-4 bg-green-100 border border-green-300 rounded-lg'>
            <p className='text-green-800 font-semibold'>
              <span role='img' aria-label='Sucesso'>
                ✅
              </span>{' '}
              Problema resolvido: Endpoints atualizados para janeiro 2025
            </p>
            <p className='text-green-700 text-sm mt-1'>
              webservices.envio.esocial.gov.br |
              webservices.consulta.esocial.gov.br
            </p>
          </div>
        </div>

        {/* Controles */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Configuração do Teste</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <Label htmlFor='cpf-empregador'>CPF do Empregador</Label>
              <Input
                id='cpf-empregador'
                type='text'
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                $theme={theme}
                placeholder='Digite o CPF da empresa'
              />
            </div>
            <div>
              <Label htmlFor='ambiente-esocial'>Ambiente</Label>
              <Select
                id='ambiente-esocial'
                value={ambiente}
                onChange={e =>
                  setAmbiente(e.target.value as 'homologacao' | 'producao')
                }
                $theme={theme}
                aria-label='Selecionar ambiente do eSocial'
                title='Selecionar ambiente do eSocial'
              >
                <option value='homologacao'>Homologação</option>
                <option value='producao'>Produção</option>
              </Select>
            </div>
            <div className='flex items-end space-x-2'>
              <UnifiedButton
                onClick={executarTeste}
                $disabled={loading}
                $variant='primary'
                $size='lg'
              >
                {loading ? (
                  <>
                    <span role='img' aria-label='Aguardando'>
                      ⏳
                    </span>{' '}
                    Testando...
                  </>
                ) : (
                  <>
                    <span role='img' aria-label='Buscar'>
                      🔍
                    </span>{' '}
                    Diagnóstico
                  </>
                )}
              </UnifiedButton>
              <UnifiedButton
                onClick={executarCadastramento}
                $disabled={loading}
                $variant='success'
                $size='lg'
              >
                {loading ? '⏳ Enviando...' : '📝 Cadastrar'}
              </UnifiedButton>
            </div>
          </div>
        </div>

        {/* Resultados */}
        {result && (
          <div className='bg-white rounded-lg shadow-md p-6'>
            <h2 className='text-2xl font-semibold mb-4'>Resultado do Teste</h2>

            {result.success ? (
              <div>
                <div className='mb-4 p-4 bg-green-100 border border-green-300 rounded-lg'>
                  <p className='text-green-800 font-semibold'>
                    <span role='img' aria-label='Sucesso'>
                      ✅
                    </span>{' '}
                    Teste executado com sucesso!
                  </p>
                </div>

                {result.data?.diagnostico && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-semibold mb-3'>
                      Diagnóstico Detalhado
                    </h3>
                    <div className='space-y-3'>
                      {result.data.diagnostico.testes?.map(
                        (teste: any, index: number) => (
                          <div
                            key={index}
                            className='border border-gray-200 rounded-lg p-4'
                          >
                            <div className='flex items-center justify-between mb-2'>
                              <h4 className='font-medium text-gray-900'>
                                {teste.nome}
                              </h4>
                              <span
                                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(teste.status)}`}
                              >
                                {getStatusIcon(teste.status)} {teste.status}
                              </span>
                            </div>
                            {teste.detalhes && (
                              <div className='text-sm text-gray-600'>
                                <pre className='whitespace-pre-wrap bg-gray-50 p-2 rounded'>
                                  {JSON.stringify(teste.detalhes, null, 2)}
                                </pre>
                              </div>
                            )}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

                {result.data?.protocolos && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-semibold mb-3'>
                      Protocolos de Envio
                    </h3>
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                      <pre className='whitespace-pre-wrap text-sm'>
                        {JSON.stringify(result.data.protocolos, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}

                {result.data?.resumo && (
                  <div className='mb-6'>
                    <h3 className='text-lg font-semibold mb-3'>
                      Resumo dos Testes
                    </h3>
                    <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
                      <div className='text-center p-3 bg-gray-50 rounded-lg'>
                        <div className='text-2xl font-bold text-gray-900'>
                          {result.data.resumo.total_testes}
                        </div>
                        <div className='text-sm text-gray-600'>Total</div>
                      </div>
                      <div className='text-center p-3 bg-green-50 rounded-lg'>
                        <div className='text-2xl font-bold text-green-600'>
                          {result.data.resumo.sucessos}
                        </div>
                        <div className='text-sm text-green-600'>Sucessos</div>
                      </div>
                      <div className='text-center p-3 bg-yellow-50 rounded-lg'>
                        <div className='text-2xl font-bold text-yellow-600'>
                          {result.data.resumo.avisos}
                        </div>
                        <div className='text-sm text-yellow-600'>Avisos</div>
                      </div>
                      <div className='text-center p-3 bg-red-50 rounded-lg'>
                        <div className='text-2xl font-bold text-red-600'>
                          {result.data.resumo.erros}
                        </div>
                        <div className='text-sm text-red-600'>Erros</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className='p-4 bg-red-100 border border-red-300 rounded-lg'>
                <p className='text-red-800 font-semibold'>
                  <span role='img' aria-label='Erro'>
                    ❌
                  </span>{' '}
                  Erro no teste: {result.error}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Informações Técnicas */}
        <div className='mt-8 bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-2xl font-semibold mb-4'>Informações Técnicas</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <h3 className='text-lg font-medium mb-2'>
                Endpoints Atualizados
              </h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>
                  • <strong>Envio:</strong> webservices.envio.esocial.gov.br
                </li>
                <li>
                  • <strong>Consulta:</strong>{' '}
                  webservices.consulta.esocial.gov.br
                </li>
                <li>
                  • <strong>Status:</strong> Funcionando ✅
                </li>
                <li>
                  • <strong>Data:</strong> Janeiro 2025
                </li>
              </ul>
            </div>
            <div>
              <h3 className='text-lg font-medium mb-2'>Funcionalidades</h3>
              <ul className='text-sm text-gray-600 space-y-1'>
                <li>• Diagnóstico completo do sistema</li>
                <li>• Cadastramento de empregador (S-1000)</li>
                <li>• Consulta de cadastros</li>
                <li>• Validação de certificados</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  return {
    props: {},
  };
};
