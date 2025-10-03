import AccessibleEmoji from '../components/AccessibleEmoji';
// task-management.tsx

import React, { useState } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';

import FilterSection from '../components/FilterSection';
import {
  Form,
  FormGroup,
  Input,
  Label,
  Select,
} from '../components/FormComponents';
import PageContainer from '../components/PageContainer';
import PageHeader from '../components/PageHeader';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import WelcomeSection from '../components/WelcomeSection';
import { UnifiedButton, UnifiedModal } from '../components/unified';
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import {
  OptimizedSectionTitle,
  OptimizedLabel,
} from '../components/shared/optimized-styles';

// Styled Components
const TaskCount = styled.span`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const TaskAssignee = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-top: 0.5rem;
`;

const TaskDueDate = styled.div<{ $isOverdue: boolean }>`
  font-size: 0.8rem;
  color: ${props => props.$isOverdue ? '#e74c3c' : '#7f8c8d'};
  margin-top: 0.5rem;
  font-weight: ${props => props.$isOverdue ? '600' : '400'};
`;

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

// Interface para dados de tarefas
interface TaskData {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in_progress' | 'completed';
  assignee: string;
  assigneeId: string;
  dueDate: string;
  createdAt: string;
  createdBy: string;
  tags: string[];
  comments: Array<{
    id: string;
    author: string;
    text: string;
    timestamp: string;
  }>;
  checklist: Array<{
    id: string;
    text: string;
    completed: boolean;
  }>;
  attachments: Array<{
    id: string;
    name: string;
    type: string;
    size: number;
    url: string;
  }>;
}

const TaskManagement: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [tasks, setTasks] = useState<TaskData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [modalType, setUnifiedModalType] = useState<'comments' | 'checklist'>(
    'comments'
  );

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  // Função para carregar tarefas da API
  const loadTasks = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const result = await response.json();
      
      if (result.success && result.data) {
        setTasks(result.data);
      } else {
        toast.error(result.error || 'Erro ao carregar tarefas');
      }
    } catch (error) {
      console.error('Erro ao carregar tarefas:', error);
      toast.error('Erro ao conectar com o servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar tarefas ao montar o componente
  React.useEffect(() => {
    loadTasks();
  }, []);
  const [selectedTask, setSelectedTask] = useState<TaskData | null>(null);
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

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newTask.title.trim()) {
      toast.error('Por favor, preencha o título da tarefa');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          titulo: newTask.title,
          descricao: newTask.description || '',
          prioridade: newTask.priority.toUpperCase(),
          atribuidoPara: newTask.assigneeId || currentProfile?.id,
          dataVencimento: newTask.dueDate || new Date().toISOString().split('T')[0],
          tags: newTask.tags || [],
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        // Recarregar a lista de tarefas
        await loadTasks();
        
        // Limpar formulário
        setNewTask({ 
          title: '', 
          priority: 'medium', 
          assignee: '', 
          assigneeId: '',
          dueDate: '',
          description: '',
          tags: []
        });
        
        toast.success('Tarefa criada com sucesso!');
      } else {
        toast.error(result.error || 'Erro ao criar tarefa');
      }
    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      toast.error('Erro ao conectar com o servidor');
    }
  };

  const handleTaskStatusChange = (
    taskId: string,
    newStatus: 'pending' | 'in_progress' | 'completed' | 'cancelled'
  ) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, status: newStatus } : task
      )
    );
    toast.success('Status da tarefa atualizado!');
  };

  const handleTaskClick = (task: TaskData, type: 'comments' | 'checklist') => {
    setSelectedTask(task);
    setUnifiedModalType(type);
    setUnifiedModalOpen(true);
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

  const getTasksByStatus = (status: 'pending' | 'in_progress' | 'completed') => {
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
      <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath='/task-management'
      />

      <TopBar $theme={theme}>
        <WelcomeSection $theme={theme}
          userAvatar='U'
          userName='Usuário'
          userRole='Usuário'
        />
      </TopBar>

      <PageHeader $theme={theme}
        title='Gestão de Tarefas'
        subtitle='Organize e acompanhe as tarefas da sua equipe de forma colaborativa'
      />

      <TaskCreationSection $theme={theme}>
        <OptimizedSectionTitle $theme={theme}>
          Criar Nova Tarefa
        </OptimizedSectionTitle>
        <TaskForm onSubmit={handleCreateTask}>
          <FormGroup>
            <OptimizedLabel>Título da Tarefa</OptimizedLabel>
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
            <OptimizedLabel htmlFor='task-priority'>Prioridade</OptimizedLabel>
            <Select
              id='task-priority'
              $theme={theme}
              value={newTask.priority}
              title="Prioridade da Tarefa"
              onChange={e =>
                setNewTask(prev => ({
                  ...prev,
                  priority: e.target.value as 'high' | 'medium' | 'low',
                }))
              }
              aria-label='Selecionar prioridade da tarefa'
            >
              <option value='low'>Baixa</option>
              <option value='medium'>Média</option>
              <option value='high'>Alta</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='task-assignee'>Responsável</OptimizedLabel>
            <Select
              id='task-assignee'
              $theme={theme}
              value={newTask.assignee}
              title="Responsável pela Tarefa"
              onChange={e =>
                setNewTask(prev => ({ ...prev, assignee: e.target.value }))
              }
              aria-label='Selecionar responsável pela tarefa'
            >
              <option value=''>Selecionar responsável</option>
              <option value='João Silva'>João Silva</option>
              <option value='Maria Santos'>Maria Santos</option>
              <option value='Pedro Costa'>Pedro Costa</option>
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel>Data de Vencimento</OptimizedLabel>
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

          <UnifiedButton type='submit' $variant='primary' $theme={theme}>
            Criar Tarefa
          </UnifiedButton>
        </TaskForm>
      </TaskCreationSection>

      <FilterSection $theme={theme} title='Filtros e Ordenação'>
        <FormGroup>
          <OptimizedLabel htmlFor='filter-status-select'>Status</OptimizedLabel>
          <Select
            id='filter-status-select'
            $theme={theme}
            aria-label='Filtrar tarefas por status'
            title="Filtrar por Status"
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
          <OptimizedLabel htmlFor='filter-priority-select'>
            Prioridade
          </OptimizedLabel>
          <Select
            id='filter-priority-select'
            $theme={theme}
            aria-label='Filtrar tarefas por prioridade'
            title="Filtrar por Prioridade"
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
          <OptimizedLabel htmlFor='filter-assignee-select'>
            Responsável
          </OptimizedLabel>
          <Select
            id='filter-assignee-select'
            $theme={theme}
            aria-label='Filtrar tarefas por responsável'
            title="Filtrar por Responsável"
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
            <TaskCount>{getTasksByStatus('pending').length}</TaskCount>
          </ColumnHeader>
          {getTasksByStatus('pending').map(task => (
            <TaskCard
              key={task.id}
              $theme={theme}
              $priority={task.priority}
              onClick={() => handleTaskStatusChange(task.id, 'in_progress')}
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
                <TaskAssignee>{task.assignee}</TaskAssignee>
              </TaskMeta>
              <TaskMeta $theme={theme}>
                <TaskDueDate $isOverdue={isOverdue(task.dueDate)}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </TaskDueDate>
                <div>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'comments');
                    }}
                  >
                    <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                    {task.comments.length}
                  </UnifiedButton>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'checklist');
                    }}
                  >
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {task.checklist.length}
                  </UnifiedButton>
                </div>
              </TaskMeta>
            </TaskCard>
          ))}
        </TaskColumn>

        <TaskColumn $theme={theme}>
          <ColumnHeader $theme={theme} $status='in-progress'>
            <h3>Em Andamento</h3>
            <span className='count'>
              {getTasksByStatus('in_progress').length}
            </span>
          </ColumnHeader>
          {getTasksByStatus('in_progress').map(task => (
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
                <TaskAssignee>{task.assignee}</TaskAssignee>
              </TaskMeta>
              <TaskMeta $theme={theme}>
                <TaskDueDate $isOverdue={isOverdue(task.dueDate)}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </TaskDueDate>
                <div>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'comments');
                    }}
                  >
                    <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                    {task.comments.length}
                  </UnifiedButton>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'checklist');
                    }}
                  >
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {task.checklist.length}
                  </UnifiedButton>
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
              onClick={() => handleTaskStatusChange(task.id, 'pending')}
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
                <TaskAssignee>{task.assignee}</TaskAssignee>
              </TaskMeta>
              <TaskMeta $theme={theme}>
                <TaskDueDate $isOverdue={isOverdue(task.dueDate)}>
                  {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                </TaskDueDate>
                <div>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'comments');
                    }}
                  >
                    <AccessibleEmoji emoji='💬' label='Comentário' />{' '}
                    {task.comments.length}
                  </UnifiedButton>
                  <UnifiedButton
                    $variant='ghost'
                    $size='sm'
                    onClick={e => {
                      e.stopPropagation();
                      handleTaskClick(task, 'checklist');
                    }}
                  >
                    <AccessibleEmoji emoji='✅' label='Sucesso' />{' '}
                    {task.checklist.length}
                  </UnifiedButton>
                </div>
              </TaskMeta>
            </TaskCard>
          ))}
        </TaskColumn>
      </TaskBoard>

      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => setUnifiedModalOpen(false)}
        title={modalType === 'comments' ? 'Comentários' : 'Checklist'}
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
                <UnifiedButton
                  $variant='primary'
                  onClick={addComment}
                  $theme={theme}
                >
                  Adicionar
                </UnifiedButton>
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
                <UnifiedButton
                  $variant='primary'
                  onClick={addChecklistItem}
                  $theme={theme}
                >
                  Adicionar
                </UnifiedButton>
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
      </UnifiedModal>
    </PageContainer>
  );
};

export default TaskManagement;
