import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export interface UserProfile {
  id: string;
  name: string;
  nickname?: string;
  role: string;
  avatar: string;
  color: string;
  cpf?: string;
  dataNascimento?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
    cep?: string;
  };
  contato?: {
    telefone?: string;
    email?: string;
  };
}

interface UserProfileContextType {
  currentProfile: UserProfile | null;
  availableProfiles: UserProfile[];
  setCurrentProfile: (profile: UserProfile) => void;
  isProfileSelected: boolean;
  setAvailableProfiles: (profiles: UserProfile[]) => void;
  clearProfile: () => void;
  showProfileModal: boolean;
  setShowProfileModal: (show: boolean) => void;
  handleProfileSelection: (profile: UserProfile) => void;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined
);

const STORAGE_KEY = 'selectedUserProfile';

export const UserProfileProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentProfile, setCurrentProfileState] = useState<UserProfile | null>(
    null
  );
  const [availableProfiles, setAvailableProfilesState] = useState<
    UserProfile[]
  >([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Carregar perfil do localStorage ao inicializar
  useEffect(() => {
    if (typeof window === 'undefined') return; // Proteção SSR

    const savedProfile = localStorage.getItem(STORAGE_KEY);
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setCurrentProfileState(profile);
      } catch (error) {
        // console.error('Erro ao carregar perfil salvo:', error);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Salvar perfil no localStorage quando mudar
  useEffect(() => {
    if (typeof window === 'undefined') return; // Proteção SSR

    if (currentProfile) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentProfile));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentProfile]);

  const setCurrentProfile = (profile: UserProfile) => {
    setCurrentProfileState(profile);
  };

  const setAvailableProfiles = (profiles: UserProfile[]) => {
    setAvailableProfilesState(profiles);
  };

  const clearProfile = () => {
    setCurrentProfileState(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  };

  const handleProfileSelection = (profile: UserProfile) => {
    setCurrentProfile(profile);
    setShowProfileModal(false);
  };

  const value = {
    currentProfile,
    availableProfiles,
    setCurrentProfile,
    isProfileSelected: !!currentProfile,
    setAvailableProfiles,
    clearProfile,
    showProfileModal,
    setShowProfileModal,
    handleProfileSelection,
  };

  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = () => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error(
      'useUserProfile deve ser usado dentro de um UserProfileProvider'
    );
  }
  return context;
};
