import AccessibleEmoji from '../components/AccessibleEmoji';
// src/pages/shopping-management.tsx
import { useRouter } from 'next/router';
import { useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
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
import { useUserProfile } from '../contexts/UserProfileContext';
import { useTheme } from '../hooks/useTheme';
import {
  UnifiedButton,
  UnifiedModal,
  UnifiedCard,
} from '../components/unified';
import {
  OptimizedFormRow,
  OptimizedSectionTitle,
  OptimizedLabel,
} from '../components/shared/optimized-styles';

// Interfaces
interface ShoppingItem {
  id: string;
  name: string;
  quantity: string;
  price?: string;
  category: string;
  isBought: boolean;
  notes?: string;
}

interface ShoppingList {
  id: string;
  name: string;
  items: ShoppingItem[];
  category: string;
  createdAt: string;
  lastModified: string;
  totalItems: number;
  boughtItems: number;
  estimatedTotal?: string;
  sharedWith?: string[];
}

interface ShoppingCategory {
  id: string;
  name: string;
  color: string;
  icon: React.ReactNode;
}

// Styled Components

const CreateListSection = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
`;

const ListsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ListCard = styled.div<{ $theme: any }>`
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 16px ${props => props.$theme.colors.shadow};
  border: 1px solid ${props => props.$theme.colors.primary}20;
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px ${props => props.$theme.colors.shadow};
  }
`;

const ListHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

const ListTitle = styled.h3`
  margin: 0;
  color: #2c3e50;
  font-size: 1.25rem;
`;

const CategoryBadge = styled.span<{ $color: string }>`
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => props.$color}20;
  color: ${props => props.$color};
`;

const ListStats = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
`;

const StatItem = styled.div`
  text-align: center;

  .stat-number {
    font-size: 1.5rem;
    font-weight: 700;
    color: #2c3e50;
    margin: 0;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #7f8c8d;
    margin: 0;
  }
`;

const ListMeta = styled.div`
  font-size: 0.8rem;
  color: #7f8c8d;
  margin-bottom: 1rem;
`;

const ListActions = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const UnifiedButtonSmall = styled.button<{
  $theme: any;
  $variant?: 'primary' | 'danger';
}>`
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 600;
  transition: all 0.3s ease;
  background: ${props =>
    props.$variant === 'danger' ? '#e74c3c' : props.$theme.colors.primary};
  color: white;

  &:hover {
    background: ${props =>
      props.$variant === 'danger'
        ? '#c0392b'
        : props.$theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const ItemList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  margin-bottom: 1rem;
`;

const ItemRow = styled.div<{ $isBought: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 8px;
  margin-bottom: 0.5rem;
  background: ${props => (props.$isBought ? '#d5f4e6' : '#f8f9fa')};
  opacity: ${props => (props.$isBought ? 0.7 : 1)};
  transition: all 0.3s ease;

  &:hover {
    background: ${props => (props.$isBought ? '#c8e6c9' : '#e9ecef')};
  }
`;

const ItemCheckbox = styled.input<{ $theme: any }>`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: ${props => props.$theme.colors.primary};
`;

const ItemInfo = styled.div<{ $isBought: boolean }>`
  flex: 1;

  .item-name {
    margin: 0;
    font-weight: 600;
    color: #2c3e50;
    text-decoration: ${props => (props.$isBought ? 'line-through' : 'none')};
  }

  .item-details {
    margin: 0;
    font-size: 0.8rem;
    color: #7f8c8d;
  }
`;

const ItemActions = styled.div`
  display: flex;
  gap: 0.25rem;
`;

const ItemUnifiedButton = styled.button<{ $theme: any }>`
  width: 28px;
  height: 28px;
  border-radius: 6px;
  border: none;
  background: ${props => props.$theme.colors.primary}20;
  color: ${props => props.$theme.colors.primary};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$theme.colors.primary}30;
    transform: scale(1.1);
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
`;

const FormRow = styled.div`
  display: flex;
  gap: 1rem;
  align-items: end;
`;

const FormGroupFlex = styled(FormGroup)`
  flex: 1;
`;

const UnifiedModalSection = styled.div`
  margin-bottom: 1rem;
`;

const AddItemForm = styled.form`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const AddItemInput = styled.input<{ $theme: any }>`
  flex: 1;
  padding: 0.75rem;
  border: 2px solid ${props => props.$theme.colors.border};
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: ${props => props.$theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.$theme.colors.primary}20;
  }
`;

const AddItemButton = styled.button<{ $theme: any }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: none;
  background: ${props => props.$theme.colors.primary};
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.$theme.colors.primaryHover};
    transform: translateY(-2px);
  }
`;

const ListSummary = styled.div<{ $theme: any }>`
  padding: 1rem;
  background: ${props => props.$theme.colors.primary}10;
  border-radius: 8px;
  margin-top: 1rem;

  .summary-title {
    margin: 0 0 0.5rem 0;
    font-weight: 600;
    color: #2c3e50;
  }

  .summary-total {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 700;
    color: ${props => props.$theme.colors.primary};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: #7f8c8d;

  .empty-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }

  .empty-title {
    margin: 0 0 0.5rem 0;
    font-size: 1.25rem;
    color: #2c3e50;
  }

  .empty-description {
    margin: 0;
    font-size: 0.9rem;
  }
`;

export default function ShoppingManagement() {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [modalOpen, setUnifiedModalOpen] = useState(false);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [newItemName, setNewItemName] = useState('');

  // Hook do contexto de perfil
  const { currentProfile } = useUserProfile();
  const { theme } = useTheme(currentProfile?.role.toLowerCase());

  const categories: ShoppingCategory[] = [
    {
      id: '1',
      name: 'Supermercado',
      color: '#3498db',
      icon: <AccessibleEmoji emoji='🛍' label='Carrinho' />,
    },
    {
      id: '2',
      name: 'Farmácia',
      color: '#e74c3c',
      icon: <AccessibleEmoji emoji='💉' label='Medicamento' />,
    },
    { id: '3', name: 'Limpeza', color: '#2ecc71', icon: '🧽' },
    { id: '4', name: 'Padaria', color: '#f39c12', icon: '🥖' },
    {
      id: '5',
      name: 'Outros',
      color: '#95a5a6',
      icon: <AccessibleEmoji emoji='📦' label='Pacote' />,
    },
  ];

  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([
    {
      id: '1',
      name: 'Compras da Semana',
      category: 'Supermercado',
      items: [
        {
          id: '1',
          name: 'Arroz',
          quantity: '2kg',
          price: '8.50',
          category: 'Alimentos',
          isBought: false,
        },
        {
          id: '2',
          name: 'Feijão',
          quantity: '1kg',
          price: '6.00',
          category: 'Alimentos',
          isBought: true,
        },
        {
          id: '3',
          name: 'Leite',
          quantity: '4L',
          price: '12.00',
          category: 'Laticínios',
          isBought: false,
        },
      ],
      createdAt: '2024-01-15',
      lastModified: '2024-01-20',
      totalItems: 3,
      boughtItems: 1,
      estimatedTotal: '26.50',
    },
    {
      id: '2',
      name: 'Farmácia',
      category: 'Farmácia',
      items: [
        {
          id: '4',
          name: 'Paracetamol',
          quantity: '1 cx',
          price: '15.00',
          category: 'Medicamentos',
          isBought: false,
        },
        {
          id: '5',
          name: 'Vitamina C',
          quantity: '1 fr',
          price: '25.00',
          category: 'Suplementos',
          isBought: false,
        },
      ],
      createdAt: '2024-01-18',
      lastModified: '2024-01-18',
      totalItems: 2,
      boughtItems: 0,
      estimatedTotal: '40.00',
    },
  ]);

  const [newList, setNewList] = useState({
    name: '',
    category: '',
  });

  const [filters, setFilters] = useState({
    search: '',
    category: '',
    showCompleted: false,
  });

  const handleCreateList = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newList.name.trim()) return;

    const list: ShoppingList = {
      id: Date.now().toString(),
      name: newList.name,
      category: newList.category,
      items: [],
      createdAt:
        new Date().toISOString().split('T')[0] || new Date().toISOString(),
      lastModified:
        new Date().toISOString().split('T')[0] || new Date().toISOString(),
      totalItems: 0,
      boughtItems: 0,
    };

    setShoppingLists(prev => [list, ...prev]);
    setNewList({ name: '', category: '' });
    toast.success('Lista de compras criada com sucesso!');
  };

  const handleDeleteList = (id: string) => {
    setShoppingLists(prev => prev.filter(list => list.id !== id));
    toast.success('Lista excluída com sucesso!');
  };

  const handleToggleItem = (listId: string, itemId: string) => {
    setShoppingLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.map(item =>
            item.id === itemId ? { ...item, isBought: !item.isBought } : item
          );
          const boughtItems = updatedItems.filter(item => item.isBought).length;
          return {
            ...list,
            items: updatedItems,
            boughtItems,
            lastModified:
              new Date().toISOString().split('T')[0] ||
              new Date().toISOString(),
          };
        }
        return list;
      })
    );
  };

  const handleAddItem = (listId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName,
      quantity: '1',
      category: 'Geral',
      isBought: false,
    };

    setShoppingLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = [...list.items, newItem];
          return {
            ...list,
            items: updatedItems,
            totalItems: updatedItems.length,
            lastModified:
              new Date().toISOString().split('T')[0] ||
              new Date().toISOString(),
          };
        }
        return list;
      })
    );

    setNewItemName('');
    toast.success('Item adicionado à lista!');
  };

  const handleDeleteItem = (listId: string, itemId: string) => {
    setShoppingLists(prev =>
      prev.map(list => {
        if (list.id === listId) {
          const updatedItems = list.items.filter(item => item.id !== itemId);
          const boughtItems = updatedItems.filter(item => item.isBought).length;
          return {
            ...list,
            items: updatedItems,
            totalItems: updatedItems.length,
            boughtItems,
            lastModified:
              new Date().toISOString().split('T')[0] ||
              new Date().toISOString(),
          };
        }
        return list;
      })
    );
    toast.success('Item removido da lista!');
  };

  const openListUnifiedModal = (list: ShoppingList) => {
    setSelectedList(list);
    setUnifiedModalOpen(true);
  };

  const getFilteredLists = () => {
    return shoppingLists.filter(list => {
      const matchesSearch =
        !filters.search ||
        list.name.toLowerCase().includes(filters.search.toLowerCase());

      const matchesCategory =
        !filters.category || list.category === filters.category;

      const matchesCompleted =
        !filters.showCompleted || list.boughtItems === list.totalItems;

      return matchesSearch && matchesCategory && matchesCompleted;
    });
  };

  const getCategoryInfo = (categoryName: string) => {
    return (
      categories.find(cat => cat.name === categoryName) || {
        color: '#95a5a6',
        icon: <AccessibleEmoji emoji='📦' label='Pacote' />,
      }
    );
  };

  const getTotalLists = () => shoppingLists.length;

  return (
    <PageContainer $theme={theme} sidebarCollapsed={sidebarCollapsed}>
      <Sidebar
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        currentPath={router.pathname}
      />

      <TopBar $theme={theme}>
        <WelcomeSection
          $theme={theme}
          userAvatar={currentProfile?.avatar || 'U'}
          userName={currentProfile?.name || 'Usuário'}
          userRole={currentProfile?.role || 'Usuário'}
          notificationCount={getTotalLists()}
          onNotificationClick={() =>
            toast.info('Notificações em desenvolvimento')
          }
        />
      </TopBar>

      <PageHeader
        $theme={theme}
        title='Gestão de Compras'
        subtitle='Organize suas listas de compras e mantenha o lar sempre abastecido'
      />

      <CreateListSection $theme={theme}>
        <OptimizedSectionTitle>Criar Nova Lista</OptimizedSectionTitle>
        <Form onSubmit={handleCreateList}>
          <OptimizedFormRow>
            <FormGroupFlex>
              <OptimizedLabel>Nome da Lista</OptimizedLabel>
              <Input
                $theme={theme}
                type='text'
                value={newList.name}
                onChange={e =>
                  setNewList(prev => ({ ...prev, name: e.target.value }))
                }
                placeholder='Ex: Compras da semana'
                required
              />
            </FormGroupFlex>

            <FormGroupFlex>
              <OptimizedLabel htmlFor='shopping-category'>
                Categoria
              </OptimizedLabel>
              <Select
                id='shopping-category'
                $theme={theme}
                value={newList.category}
                onChange={e =>
                  setNewList(prev => ({ ...prev, category: e.target.value }))
                }
                aria-label='Selecionar categoria'
                required
                title='Selecionar categoria'
              >
                <option value=''>Selecionar categoria</option>
                {categories.map(category => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </Select>
            </FormGroupFlex>

            <UnifiedButton type='submit' $variant='primary' $theme={theme}>
              <AccessibleEmoji emoji='➕' label='Novo' /> Criar Lista
            </UnifiedButton>
          </OptimizedFormRow>
        </Form>
      </CreateListSection>

      <FilterSection $theme={theme} title='Filtros e Busca'>
        <OptimizedFormRow>
          <FormGroup>
            <OptimizedLabel>Buscar Listas</OptimizedLabel>
            <Input
              $theme={theme}
              type='text'
              value={filters.search}
              onChange={e =>
                setFilters(prev => ({ ...prev, search: e.target.value }))
              }
              placeholder='Digite o nome da lista...'
            />
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-shopping-category'>
              Filtrar por Categoria
            </OptimizedLabel>
            <Select
              id='filter-shopping-category'
              $theme={theme}
              value={filters.category}
              onChange={e =>
                setFilters(prev => ({ ...prev, category: e.target.value }))
              }
              aria-label='Filtrar por categoria'
              title='Filtrar por categoria'
            >
              <option value=''>Todas as categorias</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.icon} {category.name}
                </option>
              ))}
            </Select>
          </FormGroup>

          <FormGroup>
            <OptimizedLabel htmlFor='filter-shopping-status'>
              Mostrar apenas
            </OptimizedLabel>
            <Select
              id='filter-shopping-status'
              $theme={theme}
              value={filters.showCompleted ? 'completed' : 'all'}
              onChange={e =>
                setFilters(prev => ({
                  ...prev,
                  showCompleted: e.target.value === 'completed',
                }))
              }
              aria-label='Filtrar listas'
              title='Filtrar listas'
            >
              <option value='all'>Todas as listas</option>
              <option value='completed'>Listas completas</option>
            </Select>
          </FormGroup>
        </OptimizedFormRow>
      </FilterSection>

      {getFilteredLists().length === 0 ? (
        <EmptyState>
          <div className='empty-icon'>
            <AccessibleEmoji emoji='🛍' label='Carrinho' />
          </div>
          <h3 className='empty-title'>Nenhuma lista encontrada</h3>
          <p className='empty-description'>
            Crie sua primeira lista de compras para começar a organizar suas
            compras.
          </p>
        </EmptyState>
      ) : (
        <ListsGrid>
          {getFilteredLists().map(list => {
            const categoryInfo = getCategoryInfo(list.category);
            return (
              <ListCard
                key={list.id}
                $theme={theme}
                onClick={() => openListUnifiedModal(list)}
              >
                <ListHeader>
                  <ListTitle>{list.name}</ListTitle>
                  <CategoryBadge $color={categoryInfo.color}>
                    {categoryInfo.icon} {list.category}
                  </CategoryBadge>
                </ListHeader>

                <ListStats>
                  <StatItem>
                    <p className='stat-number'>{list.totalItems}</p>
                    <p className='stat-label'>Total</p>
                  </StatItem>
                  <StatItem>
                    <p className='stat-number'>{list.boughtItems}</p>
                    <p className='stat-label'>Comprados</p>
                  </StatItem>
                  <StatItem>
                    <p className='stat-number'>
                      {list.totalItems > 0
                        ? Math.round((list.boughtItems / list.totalItems) * 100)
                        : 0}
                      %
                    </p>
                    <p className='stat-label'>Progresso</p>
                  </StatItem>
                </ListStats>

                <ListMeta>
                  <AccessibleEmoji emoji='📅' label='Calendário' /> Criada em:{' '}
                  {new Date(list.createdAt).toLocaleDateString('pt-BR')}
                  <br />
                  <AccessibleEmoji emoji='✏' label='Editar' /> Modificada em:{' '}
                  {new Date(list.lastModified).toLocaleDateString('pt-BR')}
                </ListMeta>

                <ListActions>
                  <UnifiedButtonSmall
                    $theme={theme}
                    onClick={e => {
                      e.stopPropagation();
                      openListUnifiedModal(list);
                    }}
                  >
                    <AccessibleEmoji emoji='👁' label='Ver' /> Ver
                  </UnifiedButtonSmall>
                  <UnifiedButtonSmall
                    $theme={theme}
                    onClick={e => {
                      e.stopPropagation();
                      toast.info('Compartilhamento em desenvolvimento');
                    }}
                  >
                    <AccessibleEmoji emoji='🔗' label='Compartilhar' />{' '}
                    Compartilhar
                  </UnifiedButtonSmall>
                  <UnifiedButtonSmall
                    $theme={theme}
                    $variant='danger'
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteList(list.id);
                    }}
                  >
                    <AccessibleEmoji emoji='❌' label='Excluir' /> Excluir
                  </UnifiedButtonSmall>
                </ListActions>
              </ListCard>
            );
          })}
        </ListsGrid>
      )}

      <UnifiedModal
        isOpen={modalOpen}
        onClose={() => setUnifiedModalOpen(false)}
        title={
          selectedList ? `Lista: ${selectedList.name}` : 'Lista de Compras'
        }
      >
        {selectedList && (
          <div>
            <UnifiedModalSection>
              <CategoryBadge
                $color={getCategoryInfo(selectedList.category).color}
              >
                {getCategoryInfo(selectedList.category).icon}{' '}
                {selectedList.category}
              </CategoryBadge>
            </UnifiedModalSection>

            <AddItemForm onSubmit={e => handleAddItem(selectedList.id, e)}>
              <AddItemInput
                $theme={theme}
                type='text'
                value={newItemName}
                onChange={e => setNewItemName(e.target.value)}
                placeholder='Adicionar novo item...'
              />
              <AddItemButton $theme={theme} type='submit'>
                <AccessibleEmoji emoji='➕' label='Novo' />
              </AddItemButton>
            </AddItemForm>

            <ItemList>
              {selectedList.items.map(item => (
                <ItemRow key={item.id} $isBought={item.isBought}>
                  <ItemCheckbox
                    $theme={theme}
                    type='checkbox'
                    checked={item.isBought}
                    onChange={() => handleToggleItem(selectedList.id, item.id)}
                  />
                  <ItemInfo $isBought={item.isBought}>
                    <p className='item-name'>{item.name}</p>
                    <p className='item-details'>
                      {item.quantity} {item.price && `• R$ ${item.price}`}
                    </p>
                  </ItemInfo>
                  <ItemActions>
                    <ItemUnifiedButton
                      $theme={theme}
                      onClick={() => handleDeleteItem(selectedList.id, item.id)}
                      title='Remover item'
                    >
                      <AccessibleEmoji emoji='❌' label='Excluir' />
                    </ItemUnifiedButton>
                  </ItemActions>
                </ItemRow>
              ))}
            </ItemList>

            {selectedList.items.length > 0 && (
              <ListSummary $theme={theme}>
                <p className='summary-title'>Resumo da Lista</p>
                <p className='summary-total'>
                  {selectedList.boughtItems} de {selectedList.totalItems} itens
                  comprados
                  {selectedList.estimatedTotal &&
                    ` • Total estimado: R$ ${selectedList.estimatedTotal}`}
                </p>
              </ListSummary>
            )}
          </div>
        )}
      </UnifiedModal>

      <ToastContainer
        position='top-center'
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
