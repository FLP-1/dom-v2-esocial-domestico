import { useState, useEffect } from 'react';

export interface UserGroup {
  id: string;
  nome: string;
  descricao?: string;
  cor: string;
  icone?: string;
  ativo: boolean;
  principal: boolean;
}

export interface UserProfile {
  codigo: string;
  nome: string;
  avatar?: string;
  apelido?: string;
}

export interface UserGroupsData {
  grupos: UserGroup[];
  perfilPrincipal: UserProfile | null;
}

export const useUserGroups = () => {
  const [groups, setGroups] = useState<UserGroup[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<UserGroup | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadUserGroups = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/user/groups');
      if (!response.ok) {
        throw new Error('Erro ao carregar grupos do usuário');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setGroups(data.data.grupos);
        setProfile(data.data.perfilPrincipal);
        
        // ✅ Selecionar automaticamente o grupo principal se existir
        const grupoPrincipal = data.data.grupos.find((g: UserGroup) => g.principal);
        if (grupoPrincipal) {
          setSelectedGroup(grupoPrincipal);
        } else if (data.data.grupos.length > 0) {
          // Se não há grupo principal, selecionar o primeiro
          setSelectedGroup(data.data.grupos[0]);
        }
      } else {
        throw new Error(data.error || 'Erro ao carregar grupos');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const selectGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group) {
      setSelectedGroup(group);
    }
  };

  const isEmpregador = profile?.codigo === 'empregador';
  const hasMultipleGroups = groups.length > 1;

  useEffect(() => {
    loadUserGroups();
  }, []);

  return {
    groups,
    selectedGroup,
    profile,
    loading,
    error,
    isEmpregador,
    hasMultipleGroups,
    selectGroup,
    reloadGroups: loadUserGroups
  };
};

export default useUserGroups;
