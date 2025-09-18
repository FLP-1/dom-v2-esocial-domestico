import { GetServerSideProps } from 'next';
import { useState } from 'react';

interface FluxoStep {
  id: string;
  titulo: string;
  descricao: string;
  status: 'pendente' | 'em-andamento' | 'concluido' | 'erro';
  acao?: string;
  resultado?: any;
}

interface ESocialFluxoProps {
  initialData?: any;
}

export default function ESocialFluxoCompleto({
  initialData,
}: ESocialFluxoProps) {
  const [loading, setLoading] = useState(false);
  const [cpf, setCpf] = useState('59876913700');
  const [ambiente, setAmbiente] = useState<'homologacao' | 'producao'>(
    'producao'
  );
  const [fluxo, setFluxo] = useState<FluxoStep[]>([
    {
      id: 'cadastro-empregador',
      titulo: '1. Cadastramento do Empregador (S-1000)',
      descricao:
        'Envio do evento S-1000 para cadastrar o empregador no eSocial',
      status: 'pendente',
    },
    {
      id: 'consulta-protocolo',
      titulo: '2. Consulta do Protocolo de Envio',
      descricao: 'Verificar se o protocolo foi processado e aceito',
      status: 'pendente',
    },
    {
      id: 'cadastro-empregados',
      titulo: '3. Cadastramento de Empregados (S-2200)',
      descricao: 'Envio dos eventos S-2200 para cadastrar empregados',
      status: 'pendente',
    },
    {
      id: 'consulta-cadastros',
      titulo: '4. Consulta de Cadastros',
      descricao: 'Verificar se empregador e empregados foram cadastrados',
      status: 'pendente',
    },
    {
      id: 'envio-folha-pagamento',
      titulo: '5. Envio de Folha de Pagamento (S-1200)',
      descricao: 'Envio dos eventos de folha de pagamento',
      status: 'pendente',
    },
    {
      id: 'monitoramento',
      titulo: '6. Monitoramento Contínuo',
      descricao: 'Acompanhamento de status e correções necessárias',
      status: 'pendente',
    },
  ]);

  const executarPasso = async (passoId: string) => {
    setLoading(true);

    // Atualizar status do passo para "em-andamento"
    setFluxo(prev =>
      prev.map(passo =>
        passo.id === passoId
          ? { ...passo, status: 'em-andamento' as const }
          : passo
      )
    );

    try {
      let resultado;

      switch (passoId) {
        case 'cadastro-empregador':
          resultado = await executarCadastramento();
          break;
        case 'consulta-protocolo':
          resultado = await consultarProtocolo();
          break;
        case 'cadastro-empregados':
          resultado = await cadastrarEmpregados();
          break;
        case 'consulta-cadastros':
          resultado = await consultarCadastros();
          break;
        case 'envio-folha-pagamento':
          resultado = await enviarFolhaPagamento();
          break;
        case 'monitoramento':
          resultado = await monitorarSistema();
          break;
        default:
          throw new Error('Passo não reconhecido');
      }

      // Atualizar status do passo para "concluido"
      setFluxo(prev =>
        prev.map(passo =>
          passo.id === passoId
            ? { ...passo, status: 'concluido' as const, resultado }
            : passo
        )
      );
    } catch (error) {
      // Atualizar status do passo para "erro"
      setFluxo(prev =>
        prev.map(passo =>
          passo.id === passoId
            ? { ...passo, status: 'erro' as const, resultado: error }
            : passo
        )
      );
    } finally {
      setLoading(false);
    }
  };

  const executarCadastramento = async () => {
    const response = await fetch('/api/cadastrar-com-protocolos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, ambiente }),
    });
    return await response.json();
  };

  const consultarProtocolo = async () => {
    const response = await fetch('/api/consultar-protocolo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, ambiente }),
    });
    return await response.json();
  };

  const cadastrarEmpregados = async () => {
    const response = await fetch('/api/cadastrar-empregados', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, ambiente }),
    });
    return await response.json();
  };

  const consultarCadastros = async () => {
    const response = await fetch('/api/consultar-cadastros', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, ambiente }),
    });
    return await response.json();
  };

  const enviarFolhaPagamento = async () => {
    const response = await fetch('/api/enviar-folha-pagamento', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, ambiente }),
    });
    return await response.json();
  };

  const monitorarSistema = async () => {
    const response = await fetch('/api/monitorar-sistema', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cpf, ambiente }),
    });
    return await response.json();
  };

  const executarFluxoCompleto = async () => {
    for (const passo of fluxo) {
      if (passo.status === 'pendente') {
        await executarPasso(passo.id);
        // Aguardar um pouco entre os passos
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'concluido':
        return '✅';
      case 'em-andamento':
        return '⏳';
      case 'erro':
        return '❌';
      default:
        return '⭕';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'concluido':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'em-andamento':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'erro':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className='min-h-screen bg-gray-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-4xl font-bold text-gray-900 mb-4'>
            <span role='img' aria-label='Foguete'>
              🚀
            </span>{' '}
            eSocial - Fluxo Completo Pós-Cadastramento
          </h1>
          <p className='text-xl text-gray-600'>
            Sequência completa de ações após o cadastramento inicial
          </p>
        </div>

        {/* Controles */}
        <div className='bg-white rounded-lg shadow-md p-6 mb-8'>
          <h2 className='text-2xl font-semibold mb-4'>Configuração</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
            <div>
              <label
                htmlFor='cpf-empregador-fluxo'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                CPF do Empregador
              </label>
              <input
                id='cpf-empregador-fluxo'
                type='text'
                value={cpf}
                onChange={e => setCpf(e.target.value)}
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='59876913700'
              />
            </div>
            <div>
              <label
                htmlFor='ambiente-fluxo'
                className='block text-sm font-medium text-gray-700 mb-2'
              >
                Ambiente
              </label>
              <select
                id='ambiente-fluxo'
                value={ambiente}
                onChange={e =>
                  setAmbiente(e.target.value as 'homologacao' | 'producao')
                }
                className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500'
                aria-label='Selecionar ambiente do eSocial'
                title='Selecionar ambiente do eSocial'
              >
                <option value='homologacao'>Homologação</option>
                <option value='producao'>Produção</option>
              </select>
            </div>
            <div className='flex items-end'>
              <button
                onClick={executarFluxoCompleto}
                disabled={loading}
                className='w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed'
              >
                {loading ? '⏳ Executando...' : '🚀 Executar Fluxo Completo'}
              </button>
            </div>
          </div>
        </div>

        {/* Fluxo de Passos */}
        <div className='space-y-6'>
          {fluxo.map((passo, index) => (
            <div key={passo.id} className='bg-white rounded-lg shadow-md p-6'>
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center space-x-4'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getStatusColor(passo.status)}`}
                  >
                    {getStatusIcon(passo.status)}
                  </div>
                  <div>
                    <h3 className='text-xl font-semibold text-gray-900'>
                      {passo.titulo}
                    </h3>
                    <p className='text-gray-600'>{passo.descricao}</p>
                  </div>
                </div>
                <div className='flex space-x-2'>
                  <button
                    onClick={() => executarPasso(passo.id)}
                    disabled={loading || passo.status === 'em-andamento'}
                    className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    {passo.status === 'em-andamento'
                      ? '⏳ Executando...'
                      : '▶️ Executar'}
                  </button>
                </div>
              </div>

              {/* Resultado do Passo */}
              {passo.resultado && (
                <div className='mt-4 p-4 bg-gray-50 rounded-lg'>
                  <h4 className='font-medium text-gray-900 mb-2'>Resultado:</h4>
                  <pre className='text-sm text-gray-600 whitespace-pre-wrap'>
                    {JSON.stringify(passo.resultado, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Resumo do Progresso */}
        <div className='mt-8 bg-white rounded-lg shadow-md p-6'>
          <h2 className='text-2xl font-semibold mb-4'>Resumo do Progresso</h2>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-2xl font-bold text-gray-900'>
                {fluxo.length}
              </div>
              <div className='text-sm text-gray-600'>Total</div>
            </div>
            <div className='text-center p-3 bg-green-50 rounded-lg'>
              <div className='text-2xl font-bold text-green-600'>
                {fluxo.filter(p => p.status === 'concluido').length}
              </div>
              <div className='text-sm text-green-600'>Concluídos</div>
            </div>
            <div className='text-center p-3 bg-blue-50 rounded-lg'>
              <div className='text-2xl font-bold text-blue-600'>
                {fluxo.filter(p => p.status === 'em-andamento').length}
              </div>
              <div className='text-sm text-blue-600'>Em Andamento</div>
            </div>
            <div className='text-center p-3 bg-red-50 rounded-lg'>
              <div className='text-2xl font-bold text-red-600'>
                {fluxo.filter(p => p.status === 'erro').length}
              </div>
              <div className='text-sm text-red-600'>Erros</div>
            </div>
          </div>
        </div>

        {/* Informações Importantes */}
        <div className='mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6'>
          <h3 className='text-lg font-semibold text-yellow-800 mb-2'>
            <span role='img' aria-label='Aviso'>
              ⚠️
            </span>{' '}
            Informações Importantes
          </h3>
          <ul className='text-sm text-yellow-700 space-y-1'>
            <li>• Execute os passos em sequência para melhor resultado</li>
            <li>• Aguarde a confirmação de cada passo antes de prosseguir</li>
            <li>• Em caso de erro, verifique os logs e tente novamente</li>
            <li>• O cadastramento via portal oficial ainda é necessário</li>
            <li>• Monitore regularmente o status dos eventos enviados</li>
          </ul>
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
