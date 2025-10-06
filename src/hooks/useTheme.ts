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

// Temas predefinidos para diferentes perfis - SISTEMA EQUILIBRADO
export const profileThemes: Record<string, ProfileTheme> = {
  empregado: {
    id: 'empregado',
    name: 'Empregado',
    colors: {
      primary: '#29ABE2',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#F8F9FA',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  empregador: {
    id: 'empregador',
    name: 'Empregador',
    colors: {
      primary: '#2E8B57',
      secondary: '#6B7280',
      accent: '#10B981',
      background: '#FFFFFF',
      surface: '#F0F8F0',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#D4E6D4',
      shadow: 'rgba(46, 139, 87, 0.1)',
    },
  },
  familia: {
    id: 'familia',
    name: 'Família',
    colors: {
      primary: '#9B59B6',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F3E5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E1BEE7',
      shadow: 'rgba(155, 89, 182, 0.1)',
    },
  },
  família: {
    id: 'família',
    name: 'Família',
    colors: {
      primary: '#9B59B6',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#F3E5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E1BEE7',
      shadow: 'rgba(155, 89, 182, 0.1)',
    },
  },
  admin: {
    id: 'admin',
    name: 'Administrador Técnico',
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#6B7280',
      shadow: 'rgba(107, 114, 128, 0.1)',
    },
  },
  'administrador técnico': {
    id: 'administrador técnico',
    name: 'Administrador Técnico',
    colors: {
      primary: '#6B7280',
      secondary: '#9CA3AF',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F8F9FA',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#6B7280',
      shadow: 'rgba(107, 114, 128, 0.1)',
    },
  },
  funcionario: {
    id: 'funcionario',
    name: 'Funcionário',
    colors: {
      primary: '#4682B4',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#E6F3FF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#B3D9FF',
      shadow: 'rgba(70, 130, 180, 0.1)',
    },
  },
  funcionário: {
    id: 'funcionário',
    name: 'Funcionário',
    colors: {
      primary: '#4682B4',
      secondary: '#6B7280',
      accent: '#3B82F6',
      background: '#FFFFFF',
      surface: '#E6F3FF',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#B3D9FF',
      shadow: 'rgba(70, 130, 180, 0.1)',
    },
  },
  financeiro: {
    id: 'financeiro',
    name: 'Responsável Financeiro',
    colors: {
      primary: '#FF6347',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FFF4F0',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#FFE0D6',
      shadow: 'rgba(255, 99, 71, 0.1)',
    },
  },
  'responsável financeiro': {
    id: 'responsável financeiro',
    name: 'Responsável Financeiro',
    colors: {
      primary: '#FF6347',
      secondary: '#6B7280',
      accent: '#F59E0B',
      background: '#FFFFFF',
      surface: '#FFF4F0',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#FFE0D6',
      shadow: 'rgba(255, 99, 71, 0.1)',
    },
  },
  administrador: {
    id: 'administrador',
    name: 'Administrador (Dono)',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.1)',
    },
  },
  'administrador (dono)': {
    id: 'administrador (dono)',
    name: 'Administrador (Dono)',
    colors: {
      primary: '#000000',
      secondary: '#6B7280',
      accent: '#EF4444',
      background: '#FFFFFF',
      surface: '#F5F5F5',
      text: '#1F2937',
      textSecondary: '#6B7280',
      border: '#E0E0E0',
      shadow: 'rgba(0, 0, 0, 0.1)',
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
