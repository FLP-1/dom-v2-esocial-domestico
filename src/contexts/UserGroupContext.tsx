import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface UserGroup {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  icone?: string;
}

interface UserGroupContextType {
  currentGroup: UserGroup | null;
  availableGroups: UserGroup[];
  setCurrentGroup: (group: UserGroup) => void;
  isGroupSelected: boolean;
  setAvailableGroups: (groups: UserGroup[]) => void;
  clearGroup: () => void;
  showGroupModal: boolean;
  setShowGroupModal: (show: boolean) => void;
  handleGroupSelection: (group: UserGroup) => void;
  hasMultipleGroups: boolean;
}

const UserGroupContext = createContext<UserGroupContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'selectedUserGroup';

export const UserGroupProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentGroup, setCurrentGroupState] = useState<UserGroup | null>(
    null
  );
  const [availableGroups, setAvailableGroupsState] = useState<UserGroup[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);

  // Carregar grupo do localStorage ao inicializar
  useEffect(() => {
    if (typeof window === 'undefined') return; // Proteção SSR

    const savedGroup = localStorage.getItem(STORAGE_KEY);
    if (savedGroup) {
      try {
        const group = JSON.parse(savedGroup);
        setCurrentGroupState(group);
      } catch (error) {
        // console.error('Erro ao carregar grupo salvo:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Salvar grupo no localStorage quando mudar
  useEffect(() => {
    if (typeof window === 'undefined') return; // Proteção SSR

    if (currentGroup) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentGroup));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentGroup]);

  const setCurrentGroup = (group: UserGroup) => {
    setCurrentGroupState(group);
  };

  const setAvailableGroups = (groups: UserGroup[]) => {
    setAvailableGroupsState(groups);
    
    // ✅ Só selecionar automaticamente se não há grupo salvo no localStorage
    if (!currentGroup && groups.length > 0) {
      const savedGroup = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (!savedGroup) {
        setCurrentGroupState(groups[0]);
      }
    }
  };

  const clearGroup = () => {
    setCurrentGroupState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleGroupSelection = (group: UserGroup) => {
    setCurrentGroup(group);
    setShowGroupModal(false);
  };

  const hasMultipleGroups = availableGroups.length > 1;

  const value = {
    currentGroup,
    availableGroups,
    setCurrentGroup,
    isGroupSelected: !!currentGroup,
    setAvailableGroups,
    clearGroup,
    showGroupModal,
    setShowGroupModal,
    handleGroupSelection,
    hasMultipleGroups,
  };

  return (
    <UserGroupContext.Provider value={value}>
      {children}
    </UserGroupContext.Provider>
  );
};

export const useUserGroup = () => {
  const context = useContext(UserGroupContext);
  if (context === undefined) {
    throw new Error(
      'useUserGroup deve ser usado dentro de um UserGroupProvider'
    );
  }
  return context;
};
