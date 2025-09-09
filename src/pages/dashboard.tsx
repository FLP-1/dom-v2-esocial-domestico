// src/pages/dashboard.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled, { keyframes } from 'styled-components';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { WidgetGrid } from '../components/WidgetGrid';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';

// Animações
const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

// fadeIn animation removed - now handled by Widget component

// Styled Components
// Sidebar components removed - now using reusable Sidebar component

// Widget e WidgetsGrid components removed - now using reusable components

const TaskList = styled.div`
  .task-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 0;
    border-bottom: 1px solid rgba(41, 171, 226, 0.1);

    &:last-child {
      border-bottom: none;
    }

    .checkbox {
      width: 18px;
      height: 18px;
      accent-color: #29abe2;
      cursor: pointer;
    }

    .task-text {
      flex: 1;
      color: #5a6c7d;
      font-size: 0.9rem;
    }

    .priority {
      padding: 0.25rem 0.5rem;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 500;

      &.high {
        background: rgba(231, 76, 60, 0.1);
        color: #e74c3c;
      }

      &.medium {
        background: rgba(243, 156, 18, 0.1);
        color: #f39c12;
      }

      &.low {
        background: rgba(144, 238, 144, 0.1);
        color: #90ee90;
      }
    }
  }
`;

const Modal = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: ${props => (props.$isOpen ? 'flex' : 'none')};
  align-items: center;
  justify-content: center;
  z-index: 2000;
  backdrop-filter: blur(4px);
`;

const ModalContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(41, 171, 226, 0.2);
  animation: ${slideIn} 0.3s ease-out;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1.5rem;
  }

  .title {
    font-family: 'Montserrat', sans-serif;
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  .close-button {
    background: none;
    border: none;
    color: #7f8c8d;
    cursor: pointer;
    font-size: 1.5rem;
    padding: 0.5rem;
    border-radius: 8px;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(231, 76, 60, 0.1);
      color: #e74c3c;
    }
  }
`;

const Button = styled.button<{ $variant: 'primary' | 'secondary' }>`
  background: ${props =>
    props.$variant === 'primary'
      ? 'linear-gradient(135deg, #29abe2, #90ee90)'
      : 'rgba(255, 255, 255, 0.9)'};
  color: ${props => (props.$variant === 'primary' ? '#fff' : '#2c3e50')};
  border: ${props =>
    props.$variant === 'primary'
      ? 'none'
      : '2px solid rgba(41, 171, 226, 0.2)'};
  border-radius: 12px;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-family: 'Montserrat', sans-serif;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: ${props =>
    props.$variant === 'primary'
      ? '0 4px 16px rgba(41, 171, 226, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.1)'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props =>
      props.$variant === 'primary'
        ? '0 8px 24px rgba(41, 171, 226, 0.4)'
        : '0 4px 16px rgba(41, 171, 226, 0.2)'};
  }
`;

const ModalButtonContainer = styled.div`
  margin-top: 1.5rem;
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
`;

// Tipos
interface Task {
  id: string;
  text: string;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
}

// UserProfile interface removed - using inline types

export default function Dashboard() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Perfis disponíveis
  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  const [tasks, setTasks] = useState<Task[]>([
    {
      id: '1',
      text: 'Revisar contratos de trabalho',
      completed: false,
      priority: 'high',
    },
    {
      id: '2',
      text: 'Atualizar folha de pagamento',
      completed: false,
      priority: 'medium',
    },
    {
      id: '3',
      text: 'Agendar reunião com equipe',
      completed: true,
      priority: 'low',
    },
    {
      id: '4',
      text: 'Verificar documentos de funcionários',
      completed: false,
      priority: 'high',
    },
  ]);

  const widgets = [
    {
      id: 'tasks',
      title: 'Tarefas Pendentes',
      icon: '📋',
      type: 'primary' as const,
      theme,
      metric: tasks.filter(t => !t.completed).length,
      description: 'tarefas para hoje',
      content:
        'Você tem tarefas importantes pendentes que precisam de atenção.',
    },
    {
      id: 'finances',
      title: 'Resumo Financeiro',
      icon: '💵',
      type: 'success' as const,
      theme,
      metric: 'R$ 15.420',
      description: 'saldo atual',
      content:
        'Seu saldo está positivo. Continue mantendo o controle financeiro.',
    },
    {
      id: 'documents',
      title: 'Documentos Recentes',
      icon: '📄',
      type: 'warning' as const,
      theme,
      metric: '8',
      description: 'documentos novos',
      content: 'Há novos documentos que precisam ser revisados e assinados.',
    },
    {
      id: 'team',
      title: 'Equipe Ativa',
      icon: '👥',
      type: 'secondary' as const,
      theme,
      metric: '12',
      description: 'membros ativos',
      content:
        'Sua equipe está funcionando bem. Todos os membros estão ativos.',
    },
    {
      id: 'timeclock',
      title: 'Controle de Ponto',
      icon: '⏰',
      type: 'primary' as const,
      theme,
      metric: 'Ativo',
      description: 'sistema funcionando',
      content:
        'Acesse o controle de ponto para registrar entrada, saída e intervalos.',
    },
  ];

  const handleWidgetClick = (widgetId: string) => {
    if (widgetId === 'timeclock') {
      router.push('/time-clock');
      return;
    }
    setSelectedWidget(widgetId);
    setModalOpen(true);
  };

  const handleTaskToggle = (taskId: string) => {
    setTasks(
      tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const getWidgetDetails = (widgetId: string) => {
    switch (widgetId) {
      case 'tasks':
        return {
          title: 'Detalhes das Tarefas',
          content: (
            <div>
              <h4>Tarefas Pendentes:</h4>
              <TaskList>
                {tasks
                  .filter(t => !t.completed)
                  .map(task => (
                    <div key={task.id} className='task-item'>
                      <input
                        type='checkbox'
                        className='checkbox'
                        checked={task.completed}
                        onChange={() => handleTaskToggle(task.id)}
                        aria-label={`Marcar tarefa ${task.text} como concluída`}
                      />
                      <span className='task-text'>{task.text}</span>
                      <span className={`priority ${task.priority}`}>
                        {task.priority === 'high'
                          ? 'Alta'
                          : task.priority === 'medium'
                            ? 'Média'
                            : 'Baixa'}
                      </span>
                    </div>
                  ))}
              </TaskList>
            </div>
          ),
        };
      case 'finances':
        return {
          title: 'Resumo Financeiro Detalhado',
          content: (
            <div>
              <p>Receitas do mês: R$ 25.000</p>
              <p>Despesas do mês: R$ 9.580</p>
              <p>Saldo atual: R$ 15.420</p>
              <p>Próximos vencimentos: 3 contas</p>
            </div>
          ),
        };
      case 'documents':
        return {
          title: 'Documentos Pendentes',
          content: (
            <div>
              <p>• Contrato de trabalho - Maria Santos</p>
              <p>• Declaração de IR - João Silva</p>
              <p>• Atestado médico - Pedro Costa</p>
              <p>• Férias - Ana Lima</p>
            </div>
          ),
        };
      case 'team':
        return {
          title: 'Status da Equipe',
          content: (
            <div>
              <p>Total de membros: 12</p>
              <p>Online agora: 8</p>
              <p>Em férias: 2</p>
              <p>Ausente: 2</p>
            </div>
          ),
        };
      default:
        return { title: 'Detalhes', content: 'Informações não disponíveis.' };
    }
  };

  return (
    <PageContainer theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar theme={theme}>
        <WelcomeSection
          theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={3}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Dashboard'
        subtitle='Visão geral do seu sistema de gestão doméstica'
      />

      <WidgetGrid widgets={widgets} onWidgetClick={handleWidgetClick} />

      <Modal $isOpen={modalOpen}>
        <ModalContent>
          <div className='header'>
            <h2 className='title'>
              {selectedWidget
                ? getWidgetDetails(selectedWidget).title
                : 'Detalhes'}
            </h2>
            <button
              className='close-button'
              onClick={() => setModalOpen(false)}
            >
              ✕
            </button>
          </div>
          <div>
            {selectedWidget
              ? getWidgetDetails(selectedWidget).content
              : 'Nenhum widget selecionado.'}
          </div>
          <ModalButtonContainer>
            <Button $variant='secondary' onClick={() => setModalOpen(false)}>
              Fechar
            </Button>
            <Button
              $variant='primary'
              onClick={() => {
                toast.success('Ação executada com sucesso!');
                setModalOpen(false);
              }}
            >
              Executar Ação
            </Button>
          </ModalButtonContainer>
        </ModalContent>
      </Modal>

      <ToastContainer
        position='top-right'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </PageContainer>
  );
}
