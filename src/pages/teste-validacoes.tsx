import { useState } from 'react';
import { ValidationModal } from '../components/ValidationModal';

interface TestResult {
  service: string;
  status: string;
  message: string;
  details?: any;
  timestamp: string;
}

export default function TesteValidacoes() {
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  // Estados dos modais
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [telefoneModalOpen, setTelefoneModalOpen] = useState(false);

  // Executar testes automáticos
  const executarTestes = async (
    testType: 'sms' | 'email' | 'config' | 'all'
  ) => {
    setLoading(true);
    setResults([]);

    try {
      const response = await fetch('/api/testar-validacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testType,
          email: email || 'teste@exemplo.com',
          telefone: telefone || '+5511999999999',
        }),
      });

      const result = await response.json();

      if (result.success) {
        setResults(result.results);
      } else {
        setResults([
          {
            service: 'Teste',
            status: 'error',
            message: result.message,
            timestamp: new Date().toISOString(),
          },
        ]);
      }
    } catch (error) {
      setResults([
        {
          service: 'Conexão',
          status: 'error',
          message: 'Erro de conexão com a API',
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Callbacks dos modais
  const onEmailSuccess = (data: any) => {
    console.log('✅ Email validado:', data);
    alert('Email validado com sucesso!');
  };

  const onTelefoneSuccess = (data: any) => {
    console.log('✅ Telefone validado:', data);
    alert('Telefone validado com sucesso!');
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-4xl mx-auto px-4'>
        <div className='bg-white rounded-lg shadow-lg p-6'>
          <div className='mb-8'>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              🧪 Teste de Validações
            </h1>
            <p className='text-gray-600'>
              Teste as funcionalidades de validação de email e telefone com as
              credenciais do Twilio
            </p>
          </div>

          {/* Configuração de dados para teste */}
          <div className='grid md:grid-cols-2 gap-6 mb-8'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                📧 Email para teste
              </label>
              <input
                type='email'
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder='seu-email@exemplo.com'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                📱 Telefone para teste
              </label>
              <input
                type='tel'
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder='+5511999999999'
                className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Botões de teste */}
          <div className='grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <button
              onClick={() => executarTestes('sms')}
              disabled={loading}
              className='bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors'
            >
              📱 Testar SMS
            </button>

            <button
              onClick={() => executarTestes('email')}
              disabled={loading}
              className='bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors'
            >
              📧 Testar Email
            </button>

            <button
              onClick={() => executarTestes('config')}
              disabled={loading}
              className='bg-purple-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 transition-colors'
            >
              ⚙️ Testar Config
            </button>

            <button
              onClick={() => executarTestes('all')}
              disabled={loading}
              className='bg-gray-800 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-900 disabled:opacity-50 transition-colors'
            >
              🔄 Testar Tudo
            </button>
          </div>

          {/* Testes interativos */}
          <div className='border-t border-gray-200 pt-8 mb-8'>
            <h2 className='text-xl font-semibold text-gray-900 mb-4'>
              🎯 Testes Interativos
            </h2>

            <div className='grid md:grid-cols-2 gap-4'>
              <button
                onClick={() => setEmailModalOpen(true)}
                disabled={!email}
                className='bg-indigo-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                🔐 Validar Email Interativo
              </button>

              <button
                onClick={() => setTelefoneModalOpen(true)}
                disabled={!telefone}
                className='bg-teal-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              >
                🔐 Validar Telefone Interativo
              </button>
            </div>

            <p className='text-sm text-gray-500 mt-2'>
              * Preencha os campos acima para habilitar os testes interativos
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div className='text-center py-8'>
              <div className='inline-flex items-center'>
                <svg
                  className='animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600'
                  fill='none'
                  viewBox='0 0 24 24'
                >
                  <circle
                    className='opacity-25'
                    cx='12'
                    cy='12'
                    r='10'
                    stroke='currentColor'
                    strokeWidth='4'
                  ></circle>
                  <path
                    className='opacity-75'
                    fill='currentColor'
                    d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                  ></path>
                </svg>
                <span className='text-blue-600 font-medium'>
                  Executando testes...
                </span>
              </div>
            </div>
          )}

          {/* Resultados */}
          {results.length > 0 && (
            <div className='border-t border-gray-200 pt-8'>
              <h2 className='text-xl font-semibold text-gray-900 mb-4'>
                📊 Resultados dos Testes
              </h2>

              <div className='space-y-4'>
                {results.map((result, index) => (
                  <div
                    key={index}
                    className={`border rounded-lg p-4 ${
                      result.status === 'success'
                        ? 'border-green-200 bg-green-50'
                        : result.status === 'error'
                          ? 'border-red-200 bg-red-50'
                          : 'border-yellow-200 bg-yellow-50'
                    }`}
                  >
                    <div className='flex items-start justify-between'>
                      <div className='flex-1'>
                        <div className='flex items-center mb-2'>
                          <span className='text-lg mr-2'>
                            {result.status === 'success'
                              ? '✅'
                              : result.status === 'error'
                                ? '❌'
                                : '⚠️'}
                          </span>
                          <h3 className='font-semibold text-gray-900'>
                            {result.service}
                          </h3>
                          <span
                            className={`ml-2 px-2 py-1 text-xs rounded-full ${
                              result.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : result.status === 'error'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {result.status}
                          </span>
                        </div>
                        <p className='text-gray-700 mb-2'>{result.message}</p>

                        {result.details && (
                          <details className='text-sm'>
                            <summary className='cursor-pointer text-gray-500 hover:text-gray-700'>
                              Ver detalhes
                            </summary>
                            <pre className='mt-2 p-3 bg-gray-100 rounded text-xs overflow-x-auto'>
                              {JSON.stringify(result.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>

                      <span className='text-xs text-gray-500 ml-4'>
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações sobre credenciais */}
          <div className='mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg'>
            <h3 className='font-semibold text-blue-900 mb-2'>
              🔑 Informações sobre Credenciais
            </h3>
            <div className='text-sm text-blue-800 space-y-1'>
              <p>
                • <strong>SMS:</strong> Usando credenciais do Twilio (ACf606...)
              </p>
              <p>
                • <strong>Email:</strong> Suporte a Twilio SendGrid e Nodemailer
              </p>
              <p>
                • <strong>Fallback:</strong> Sistema usa credenciais locais se
                ambiente não configurado
              </p>
              <p>
                • <strong>Simulação:</strong> Modo de desenvolvimento quando
                credenciais ausentes
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modais de validação */}
      <ValidationModal
        isOpen={emailModalOpen}
        onClose={() => setEmailModalOpen(false)}
        onSuccess={onEmailSuccess}
        tipo='email'
        valor={email}
        titulo='Teste de Validação de Email'
      />

      <ValidationModal
        isOpen={telefoneModalOpen}
        onClose={() => setTelefoneModalOpen(false)}
        onSuccess={onTelefoneSuccess}
        tipo='telefone'
        valor={telefone}
        titulo='Teste de Validação de Telefone'
      />
    </div>
  );
}
