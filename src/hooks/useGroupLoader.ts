import { useEffect, useRef } from 'react';
import { useUserGroup } from '../contexts/UserGroupContext';

export const useGroupLoader = () => {
  const { setAvailableGroups, availableGroups } = useUserGroup();
  const hasLoadedRef = useRef(false); // ✅ Flag para evitar carregamentos múltiplos

  useEffect(() => {
    // ✅ Só carregar se ainda não carregou e não há grupos
    if (hasLoadedRef.current || availableGroups.length > 0) {
      return;
    }

    const loadGroups = async () => {
      try {
        hasLoadedRef.current = true; // ✅ Marcar como carregando
        const response = await fetch('/api/user/groups');
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data && data.data.grupos) {
            setAvailableGroups(data.data.grupos);
          }
        }
      } catch (error) {
        console.warn('Erro ao carregar grupos:', error);
        hasLoadedRef.current = false; // ✅ Permitir nova tentativa em caso de erro
      }
    };

    loadGroups();
  }, [setAvailableGroups, availableGroups.length]); // ✅ Dependências corretas

  return { groups: availableGroups };
};
