import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Group {
  id: string;
  nome: string;
  descricao: string;
  cor: string;
  icone: string;
  tipo: string;
  privado: boolean;
  ativo: boolean;
}

interface GroupContextType {
  availableGroups: Group[];
  selectedGroup: Group | null;
  setAvailableGroups: (groups: Group[]) => void;
  selectGroup: (group: Group) => void;
  showGroupModal: boolean;
  setShowGroupModal: (show: boolean) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
}

const GroupContext = createContext<GroupContextType | undefined>(undefined);

export const useGroup = () => {
  const context = useContext(GroupContext);
  if (!context) {
    throw new Error('useGroup deve ser usado dentro de um GroupProvider');
  }
  return context;
};

interface GroupProviderProps {
  children: React.ReactNode;
}

export const GroupProvider: React.FC<GroupProviderProps> = ({ children }) => {
  const [availableGroups, setAvailableGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);
    setShowGroupModal(false);
    
    // Salvar no localStorage
    localStorage.setItem('selectedGroup', JSON.stringify(group));
  };

  // Carregar grupo salvo ao inicializar
  useEffect(() => {
    const savedGroup = localStorage.getItem('selectedGroup');
    if (savedGroup) {
      try {
        const group = JSON.parse(savedGroup);
        setSelectedGroup(group);
      } catch (error) {
        console.error('Erro ao carregar grupo salvo:', error);
        localStorage.removeItem('selectedGroup');
      }
    }
  }, []);

  const value: GroupContextType = {
    availableGroups,
    selectedGroup,
    setAvailableGroups,
    selectGroup,
    showGroupModal,
    setShowGroupModal,
    loading,
    setLoading
  };

  return (
    <GroupContext.Provider value={value}>
      {children}
    </GroupContext.Provider>
  );
};
