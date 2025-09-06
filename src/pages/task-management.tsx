import AccessibleEmoji from '../components/AccessibleEmoji';
// task-management.tsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import ActionButton from '../components/ActionButton';
import FilterSection from '../components/FilterSection';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Select,
} from '../components/FormComponents';
import Modal from '../components/Modal';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { useTheme } from '../hooks/useTheme';

// Interfaces
interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'todo' | 'in-progress' | 'completed';
  assignee: string;
  dueDate: string;
  createdAt: string;
  comments: Comment[];
  checklist: ChecklistItem[];
}

interface Comment {
  id: string;
  text: string;
  author: string;
  avatar: string;
  timestamp: string;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

// Styled Components
const MainContent = styled.div<{ $sidebarCollapsed: boolean }>`
  margin-left: ${props => (props.$sidebarCollapsed ? '80px' : '280px')};
  padding: 2rem;
  transition: margin-left 0.3s ease;
  min-height: 100vh;
`;

const TaskCreationSection = styled.section<{ $theme: any }>`
  background: ${props => props.$theme.colors.background};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 12px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const SectionTitle = styled.h2<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &::before {
    content: '📝';
    font-size: 1.2rem;
  }
`;

const TaskForm = styled(Form)`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const TaskBoard = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const TaskColumn = styled.div<{ $theme: any }>`
  background: ${props => props.$theme.colors.background};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 12px;
  padding: 1.5rem;
  min-height: 500px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const ColumnHeader = styled.div<{ $theme: any; $status: string }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid
    ${props => {
      switch (props.$status) {
        case 'todo':
          return '#f59e0b';
        case 'in-progress':
          return '#3b82f6';
        case 'completed':
          return '#10b981';
        default:
          return props.$theme.colors.border;
      }
    }};

  h3 {
    color: ${props => props.$theme.colors.text};
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0;
  }

  .count {
    background: ${props => {
      switch (props.$status) {
        case 'todo':
          return '#fef3c7';
        case 'in-progress':
          return '#dbeafe';
        case 'completed':
          return '#d1fae5';
        default:
          return props.$theme.colors.background;
      }
    }};
    color: ${props => {
      switch (props.$status) {
        case 'todo':
          return '#92400e';
        case 'in-progress':
          return '#1e40af';
        case 'completed':
          return '#065f46';
        default:
          return props.$theme.colors.text;
      }
    }};
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 600;
  }
`;

const TaskCard = styled.div<{ $theme: any; $priority: string }>`
  background: ${props => props.$theme.colors.background};
  border: 1px solid
    ${props => {
      switch (props.$priority) {
        case 'high':
          return '#ef4444';
        case 'medium':
          return '#f59e0b';
        case 'low':
          return '#10b981';
        default:
          return props.$theme.colors.border;
      }
    }};
  border-left: 4px solid
    ${props => {
      switch (props.$priority) {
        case 'high':
          return '#ef4444';
        case 'medium':
          return '#f59e0b';
        case 'low':
          return '#10b981';
        default:
          return props.$theme.colors.primary;
      }
    }};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  }

  h4 {
    color: ${props => props.$theme.colors.text};
    font-size: 1rem;
    font-weight: 600;
    margin: 0 0 0.5rem 0;
  }

  p {
    color: ${props => props.$theme.colors.textSecondary};
    font-size: 0.875rem;
    margin: 0 0 0.75rem 0;
    line-height: 1.4;
  }
`;

const TaskMeta = styled.div<{ $theme: any }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: ${props => props.$theme.colors.textSecondary};

  .assignee {
    font-weight: 500;
  }

  .due-date {
    &.overdue {
      color: #ef4444;
      font-weight: 600;
    }
  }
`;

const PriorityBadge = styled.span<{ $priority: string }>`
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  background: ${props => {
    switch (props.$priority) {
      case 'high':
        return '#fef2f2';
      case 'medium':
        return '#fffbeb';
      case 'low':
        return '#f0fdf4';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${props => {
    switch (props.$priority) {
      case 'high':
        return '#dc2626';
      case 'medium':
        return '#d97706';
      case 'low':
        return '#059669';
      default:
        return '#374151';
    }
  }};
`;

const CommentSection = styled.div<{ $theme: any }>`
  margin-bottom: 2rem;
`;

const CommentForm = styled.form<{ $theme: any }>`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const CommentItem = styled.div<{ $theme: any }>`
  background: ${props => props.$theme.colors.background};
  border: 1px solid ${props => props.$theme.colors.border};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const CommentHeader = styled.div<{ $theme: any }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const CommentAvatar = styled.div<{ $theme: any }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${props => props.$theme.colors.primary};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
`;

const CommentText = styled.p<{ $theme: any }>`
  color: ${props => props.$theme.colors.text};
  margin: 0;
  line-height: 1.4;
`;

const CommentTime = styled.span<{ $theme: any }>`
  color: ${props => props.$theme.colors.textSecondary};
  font-size: 0.75rem;
`;

const ChecklistSection = styled.div<{ $theme: any }>`
  margin-bottom: 2rem;
`;

const ChecklistForm = styled.form<{ $theme: any }>`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ChecklistItem = styled.div<{ $theme: any }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid ${props => props.$theme.colors.border};

  &:last-child {
    border-bottom: none;
  }

  input[type='checkbox'] {
    width: 18px;
    height: 18px;
    accent-color: ${props => props.$theme.colors.primary};
  }

  label {
    color: ${props => props.$theme.colors.text};
    font-size: 0.875rem;
    cursor: pointer;
    flex: 1;

    &.completed {
      text-decoration: line-through;
      color: ${props => props.$theme.colors.textSecondary};
    }
  }
`;

const CommentAuthor = styled.div<{ $theme: any }>`
  font-weight: 600;
  color: ${props => props.$theme.colors.text};
`;

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Implementar autenticação',
    description: 'Criar sistema de login e registro de usuários',
    priority: 'high',
    status: 'in-progress',
    assignee: 'João Silva',
    dueDate: '2024-01-15',
    createdAt: '2024-01-10',
    comments: [
      {
        id: '1',
        text: 'Vou começar pela validação de formulários',
        author: 'João Silva',
        avatar: 'JS',
        timestamp: '2024-01-10T10:00:00Z',
      },
    ],
    checklist: [
      { id: '1', text: 'Criar formulário de login', completed: true },
      { id: '2', text: 'Implementar validação', completed: false },
      { id: '3', text: 'Adicionar recuperação de senha', completed: false },
    ],
  },
  {
    id: '2',
    title: 'Design do dashboard',
    description: 'Criar interface principal do sistema',
    priority: 'medium',
    status: 'todo',
    assignee: 'Maria Santos',
    dueDate: '2024-01-20',
    createdAt: '2024-01-12',
    comments: [],
    checklist: [
      { id: '1', text: 'Wireframes', completed: false },
      { id: '2', text: 'Prototipagem', completed: false },
    ],
  },
  {
    id: '3',
    title: 'Testes unitários',
    description: 'Implementar testes para componentes principais',
    priority: 'low',
    status: 'completed',
    assignee: 'Pedro Costa',
    dueDate: '2024-01-18',
    createdAt: '2024-01-08',
    comments: [
      {
        id: '1',
        text: 'Testes implementados com sucesso!',
        author: 'Pedro Costa',
        avatar: 'PC',
        timestamp: '2024-01-18T15:30:00Z',
      },
    ],
    checklist: [
      { id: '1', text: 'Testes de componentes', completed: true },
      { id: '2', text: 'Testes de integração', completed: true },
    ],
  },
];

const TaskManagement: React.FC = () => {
  const { theme } = useTheme();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<Task[]>(mockTasks);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'comments' | 'checklist'>(
    'comments'
  );
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    assignee: '',
    dueDate: '',
  });
  const [newComment, setNewComment] = useState('');
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
  });

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      toast.error('Por favor, preencha o título da tarefa');
      return;
    }

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: '',
      priority: newTask.priority,
      status: 'todo',
      assignee: newTask.assignee,
      dueDate: newTask.dueDate,
      createdAt: new Date().toISOString(),
      comments: [],
      checklist: [],
    };

    setTasks(prev => [...prev, task]);
    setNewTask({ title: '', priority: 'medium', assignee: '', dueDate: '' });
    toast.success('Tarefa criada com sucesso!');
  };

  const handleTaskStatusChange = (
    taskId: string,
    newStatus: 'todo' | 'in-progress' | 'completed'
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    toast.success('Status da tarefa atualizado!');
  };

  const handleTaskClick = (task: Task, type: 'comments' | 'checklist') => {
    setSelectedTask(task);
    setModalType(type);
    setModalOpen(true);
  };

  const addComment = () => {
    if (!newComment.trim() || !selectedTask) return;

    const comment: Comment = {
      id: Date.now().toString(),
      text: newComment,
      author: 'Usuário',
      avatar: 'U',
      timestamp: new Date().toISOString(),
    };

    setTasks(prev =>
      prev.map(task =>
        task.id === selectedTask.id
          ? { ...task, comments: [...task.comments, comment] }
          : task
      )
    );

    setNewComment('');
    toast.success('Comentário adicionado!');
  };

  const addChecklistItem = () => {
    if (!newChecklistItem.trim() || !selectedTask) return;

    const item: ChecklistItem = {
      id: Date.now().toString(),
      text: newChecklistItem,
      completed: false,
    };

    setTasks(prev =>
      prev.map(task =>
        task.id === selectedTask.id
          ? { ...task, checklist: [...task.checklist, item] }
          : task
      )
    );

    setNewChecklistItem('');
    toast.success('Item adicionado ao checklist!');
  };

  const toggleChecklistItem = (taskId: string, itemId: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId
          ? {
              ...task,
              checklist: task.checklist.map(item =>
                item.id === itemId
                  ? { ...item, completed: !item.completed }
                  : item
              ),
            }
          : task
      )
    );
  };

  const getTasksByStatus = (status: 'todo' | 'in-progress' | 'completed') => {
    return tasks.filter(task => task.status === status);
  };

  const isOverdue = (dueDate: string) => {
    return (
      new Date(dueDate) < new Date() &&
      tasks.find(t => t.dueDate === dueDate)?.status !== 'completed'
    );
  };

  const getUniqueAssignees = () => {
    const assignees = tasks.map(task => task.assignee).filter(Boolean);
    return Array.from(new Set(assignees));
  };

  return (
    <PageContainer theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath='/task-management'
      />

      <TopBar theme={theme}>
        <WelcomeSection
          theme={theme}
          userAvatar='U'
          userName='Usuário'
          userRole='Usuário'
        />
      </TopBar>

      <PageHeader
        theme={theme}
        title='Gestão de Tarefas'
        subtitle='Organize e acompanhe as tarefas da sua equipe de forma colaborativa'
      />

      <MainContent $sidebarCollapsed={sidebarCollapsed}>
        <TaskCreationSection $theme={theme}>
          <SectionTitle $theme={theme}>Criar Nova Tarefa</SectionTitle>
          <TaskForm onSubmit={handleCreateTask}>
            <FormGroup>
              <Label>Título da Tarefa</Label>
              <Input
                $theme={theme}
                type='text'
                value={newTask.title}
                onChange={e =>
                  setNewTask(prev => ({ ...prev, title: e.target.value }))
                }
                placeholder='Digite o título da tarefa'
                required
              />
            </FormGroup>

            <FormGroup>
              <Label htmlFor='task-priority'>Prioridade</Label>
              <Select
                id='task-priority'
                $theme={theme}
                value={newTask.priority}
                onChange={e =>
                  setNewTask(prev => ({
                    ...prev,
                    priority: e.target.value as 'high' | 'medium' | 'low',
                  }))
                }
                aria-label='Selecionar prioridade da tarefa'
                title='Selecionar prioridade da tarefa'
              >
                <option value='low'>Baixa</option>
                <option value='medium'>Média</option>
                <option value='high'>Alta</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label htmlFor='task-assignee'>Responsável</Label>
              <Select
                id='task-assignee'
                $theme={theme}
                value={newTask.assignee}
                onChange={e =>
                  setNewTask(prev => ({ ...prev, assignee: e.target.value }))
                }
                aria-label='Selecionar responsável pela tarefa'
                title='Selecionar responsável pela tarefa'
              >
                <option value=''>Selecionar responsável</option>
                <option value='João Silva'>João Silva</option>
                <option value='Maria Santos'>Maria Santos</option>
                <option value='Pedro Costa'>Pedro Costa</option>
              </Select>
            </FormGroup>

            <FormGroup>
              <Label>Data de Vencimento</Label>
              <Input
                $theme={theme}
                type='date'
                value={newTask.dueDate}
                onChange={e =>
                  setNewTask(prev => ({ ...prev, dueDate: e.target.value }))
                }
                required
              />
            </FormGroup>

            <ActionButton type='submit' variant='primary' theme={theme}>
              Criar Tarefa
            </ActionButton>
          </TaskForm>
        </TaskCreationSection>

        <FilterSection theme={theme} title='Filtros e Ordenação'>
          <FormGroup>
            <Label htmlFor='filter-status-select'>Status</Label>
            <Select
              id='filter-status-select'
              $theme={theme}
              aria-label='Filtrar tarefas por status'
              title='Filtrar tarefas por status'
              value={filters.status}
              onChange={e =>
                setFilters(prev => ({ ...prev, status: e.target.value }))
              }
            >
              <option value='all'>Todos os status</option>
              <option value='todo'>A Fazer</option>
              <option value='in-progress'>Em Andamento</option>
              <option value='completed'>Concluído</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor='filter-priority-select'>Prioridade</Label>
            <Select
              id='filter-priority-select'
              $theme={theme}
              aria-label='Filtrar tarefas por prioridade'
              title='Filtrar tarefas por prioridade'
              value={filters.priority}
              onChange={e =>
                setFilters(prev => ({ ...prev, priority: e.target.value }))
              }
            >
              <option value='all'>Todas as prioridades</option>
              <option value='high'>Alta</option>
              <option value='medium'>Média</option>
              <option value='low'>Baixa</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <Label htmlFor='filter-assignee-select'>Responsável</Label>
            <Select
              id='filter-assignee-select'
              $theme={theme}
              aria-label='Filtrar tarefas por responsável'
              title='Filtrar tarefas por responsável'
              value={filters.assignee}
              onChange={e =>
                setFilters(prev => ({ ...prev, assignee: e.target.value }))
              }
            >
              <option value='all'>Todos os responsáveis</option>
              {getUniqueAssignees().map(assignee => (
                <option key={assignee} value={assignee}>
                  {assignee}
                </option>
              ))}
            </Select>
          </FormGroup>
        </FilterSection>

        <TaskBoard>
          <TaskColumn $theme={theme}>
            <ColumnHeader $theme={theme} $status='todo'>
              <h3>A Fazer</h3>
              <span className='count'>{getTasksByStatus('todo').length}</span>
            </ColumnHeader>
            {getTasksByStatus('todo').map(task => (
              <TaskCard
                key={task.id}
                $theme={theme}
                $priority={task.priority}
                onClick={() => handleTaskStatusChange(task.id, 'in-progress')}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <TaskMeta $theme={theme}>
                  <div>
                    <PriorityBadge $priority={task.priority}>
                      {task.priority === 'high'
                        ? 'Alta'
                        : task.priority === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                    </PriorityBadge>
                  </div>
                  <div className='assignee'>{task.assignee}</div>
                </TaskMeta>
                <TaskMeta $theme={theme}>
                  <div
                    className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}
                  >
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleTaskClick(task, 'comments');
                      }}
                    >
                      <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                      {task.comments.length}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleTaskClick(task, 'checklist');
                      }}
                    >
                      <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                      {task.checklist.length}
                    </button>
                  </div>
                </TaskMeta>
              </TaskCard>
            ))}
          </TaskColumn>

          <TaskColumn $theme={theme}>
            <ColumnHeader $theme={theme} $status='in-progress'>
              <h3>Em Andamento</h3>
              <span className='count'>
                {getTasksByStatus('in-progress').length}
              </span>
            </ColumnHeader>
            {getTasksByStatus('in-progress').map(task => (
              <TaskCard
                key={task.id}
                $theme={theme}
                $priority={task.priority}
                onClick={() => handleTaskStatusChange(task.id, 'completed')}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <TaskMeta $theme={theme}>
                  <div>
                    <PriorityBadge $priority={task.priority}>
                      {task.priority === 'high'
                        ? 'Alta'
                        : task.priority === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                    </PriorityBadge>
                  </div>
                  <div className='assignee'>{task.assignee}</div>
                </TaskMeta>
                <TaskMeta $theme={theme}>
                  <div
                    className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}
                  >
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleTaskClick(task, 'comments');
                      }}
                    >
                      <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                      {task.comments.length}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleTaskClick(task, 'checklist');
                      }}
                    >
                      <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                      {task.checklist.length}
                    </button>
                  </div>
                </TaskMeta>
              </TaskCard>
            ))}
          </TaskColumn>

          <TaskColumn $theme={theme}>
            <ColumnHeader $theme={theme} $status='completed'>
              <h3>Concluído</h3>
              <span className='count'>
                {getTasksByStatus('completed').length}
              </span>
            </ColumnHeader>
            {getTasksByStatus('completed').map(task => (
              <TaskCard
                key={task.id}
                $theme={theme}
                $priority={task.priority}
                onClick={() => handleTaskStatusChange(task.id, 'todo')}
              >
                <h4>{task.title}</h4>
                <p>{task.description}</p>
                <TaskMeta $theme={theme}>
                  <div>
                    <PriorityBadge $priority={task.priority}>
                      {task.priority === 'high'
                        ? 'Alta'
                        : task.priority === 'medium'
                          ? 'Média'
                          : 'Baixa'}
                    </PriorityBadge>
                  </div>
                  <div className='assignee'>{task.assignee}</div>
                </TaskMeta>
                <TaskMeta $theme={theme}>
                  <div
                    className={`due-date ${isOverdue(task.dueDate) ? 'overdue' : ''}`}
                  >
                    {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleTaskClick(task, 'comments');
                      }}
                    >
                      <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                      {task.comments.length}
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        handleTaskClick(task, 'checklist');
                      }}
                    >
                      <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                      {task.checklist.length}
                    </button>
                  </div>
                </TaskMeta>
              </TaskCard>
            ))}
          </TaskColumn>
        </TaskBoard>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title={modalType === 'comments' ? 'Comentários' : 'Checklist'}
          buttonContainer={
            <ActionButton
              variant='secondary'
              onClick={() => setModalOpen(false)}
              theme={theme}
            >
              Fechar
            </ActionButton>
          }
        >
          {modalType === 'comments' && selectedTask && (
            <div>
              <CommentSection $theme={theme}>
                <CommentForm $theme={theme}>
                  <Input
                    $theme={theme}
                    type='text'
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    placeholder='Digite seu comentário...'
                  />
                  <ActionButton
                    variant='primary'
                    onClick={addComment}
                    theme={theme}
                  >
                    Adicionar
                  </ActionButton>
                </CommentForm>
              </CommentSection>

              <div>
                <h4>Comentários ({selectedTask.comments.length})</h4>
                {selectedTask.comments.map(comment => (
                  <CommentItem key={comment.id} $theme={theme}>
                    <CommentHeader $theme={theme}>
                      <CommentAvatar $theme={theme}>
                        {comment.avatar}
                      </CommentAvatar>
                      <div>
                        <CommentAuthor $theme={theme}>
                          {comment.author}
                        </CommentAuthor>
                        <CommentTime $theme={theme}>
                          {new Date(comment.timestamp).toLocaleString('pt-BR')}
                        </CommentTime>
                      </div>
                    </CommentHeader>
                    <CommentText $theme={theme}>{comment.text}</CommentText>
                  </CommentItem>
                ))}
              </div>
            </div>
          )}

          {modalType === 'checklist' && selectedTask && (
            <div>
              <ChecklistSection $theme={theme}>
                <ChecklistForm $theme={theme}>
                  <Input
                    $theme={theme}
                    type='text'
                    value={newChecklistItem}
                    onChange={e => setNewChecklistItem(e.target.value)}
                    placeholder='Digite o item do checklist...'
                  />
                  <ActionButton
                    variant='primary'
                    onClick={addChecklistItem}
                    theme={theme}
                  >
                    Adicionar
                  </ActionButton>
                </ChecklistForm>
              </ChecklistSection>

              <div>
                <h4>Checklist ({selectedTask.checklist.length} itens)</h4>
                {selectedTask.checklist.map(item => (
                  <ChecklistItem key={item.id} $theme={theme}>
                    <input
                      type='checkbox'
                      id={`checklist-${item.id}`}
                      checked={item.completed}
                      onChange={() =>
                        toggleChecklistItem(selectedTask.id, item.id)
                      }
                    />
                    <label
                      htmlFor={`checklist-${item.id}`}
                      className={item.completed ? 'completed' : ''}
                    >
                      {item.text}
                    </label>
                  </ChecklistItem>
                ))}
              </div>
            </div>
          )}
        </Modal>
      </MainContent>
    </PageContainer>
  );
};

export default TaskManagement;
