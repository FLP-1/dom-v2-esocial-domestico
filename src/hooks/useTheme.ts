import { useEffect, useState } from 'react';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

export interface ProfileTheme {
  id: string;
  name: string;
  colors: ThemeColors;
}

// Temas predefinidos para diferentes perfis
export const profileThemes: Record<string, ProfileTheme> = {
  empregado: {
    id: 'empregado',
    name: 'Empregado',
    colors: {
      primary: '#29ABE2',
      secondary: '#90EE90',
      accent: '#FFDA63',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#E9ECEF',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  empregador: {
    id: 'empregador',
    name: 'Empregador',
    colors: {
      primary: '#E74C3C',
      secondary: '#F39C12',
      accent: '#9B59B6',
      background: '#FFFFFF',
      surface: '#FDF2F2',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#FADBD8',
      shadow: 'rgba(231, 76, 60, 0.1)',
    },
  },
  familia: {
    id: 'familia',
    name: 'Família',
    colors: {
      primary: '#9B59B6',
      secondary: '#E91E63',
      accent: '#FF9800',
      background: '#FFFFFF',
      surface: '#F3E5F5',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#E1BEE7',
      shadow: 'rgba(155, 89, 182, 0.1)',
    },
  },
  admin: {
    id: 'admin',
    name: 'Administrador',
    colors: {
      primary: '#34495E',
      secondary: '#2ECC71',
      accent: '#F1C40F',
      background: '#FFFFFF',
      surface: '#F4F6F7',
      text: '#2C3E50',
      textSecondary: '#7F8C8D',
      border: '#D5DBDB',
      shadow: 'rgba(52, 73, 94, 0.1)',
    },
  },
};

export const useTheme = (profileId?: string) => {
  const [currentTheme, setCurrentTheme] = useState<ProfileTheme>(() => {
    return (
      profileThemes['empregado'] ||
      Object.values(profileThemes)[0] || {
        id: 'default',
        name: 'Default',
        colors: {
          primary: '#29ABE2',
          secondary: '#90EE90',
          accent: '#29ABE2',
          background: '#f8f9fa',
          surface: '#ffffff',
          text: '#2c3e50',
          textSecondary: '#7f8c8d',
          border: '#e0e0e0',
          shadow: 'rgba(0, 0, 0, 0.1)',
        },
      }
    );
  });

  useEffect(() => {
    if (profileId && profileThemes[profileId]) {
      setCurrentTheme(profileThemes[profileId]);
    }
  }, [profileId]);

  const updateTheme = (profileId: string) => {
    if (profileThemes[profileId]) {
      setCurrentTheme(profileThemes[profileId]);
    }
  };

  return {
    theme: currentTheme,
    updateTheme,
    availableThemes: Object.values(profileThemes),
  };
};
