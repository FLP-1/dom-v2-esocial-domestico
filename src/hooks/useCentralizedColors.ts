import { useSystemConfig } from './useSystemConfig';
import { geofencingColors } from '../design-system/tokens/geofencing-colors';

export const useCentralizedColors = () => {
  const { config, loading, error } = useSystemConfig();
  
  // Se as configurações do sistema estão carregando ou há erro, usar cores padrão
  if (loading || error || !config) {
    return {
      colors: {
        ...geofencingColors,
        // Garantir que sempre tenha as propriedades esperadas pelo PageContainer
        surface: geofencingColors.background.primary,
        border: geofencingColors.border.light,
        primary: '#29ABE2',
        secondary: '#90EE90',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      loading,
      error,
    };
  }
  
  // Mesclar cores do sistema com cores específicas
  const mergedColors = {
    ...geofencingColors,
    // Garantir que sempre tenha as propriedades esperadas pelo PageContainer
    surface: config.colors.background || geofencingColors.background.primary,
    border: config.colors.border || geofencingColors.border.light,
    primary: config.colors.primary,
    secondary: config.colors.secondary,
    success: config.colors.success,
    warning: config.colors.warning,
    error: config.colors.error,
    info: config.colors.info,
    // Sobrescrever algumas cores com as do sistema centralizado
    status: {
      ...geofencingColors.status,
      success: {
        ...geofencingColors.status.success,
        background: `${config.colors.success}20`, // 20% opacity
        text: config.colors.success,
        color: config.colors.success,
      },
      error: {
        ...geofencingColors.status.error,
        background: `${config.colors.error}20`, // 20% opacity
        text: config.colors.error,
        color: config.colors.error,
      },
      warning: {
        ...geofencingColors.status.warning,
        background: `${config.colors.warning}20`, // 20% opacity
        text: config.colors.warning,
        color: config.colors.warning,
      },
      info: {
        ...geofencingColors.status.info,
        background: `${config.colors.info}20`, // 20% opacity
        text: config.colors.info,
        color: config.colors.info,
      },
    },
    button: {
      ...geofencingColors.button,
      primary: {
        ...geofencingColors.button.primary,
        background: config.colors.primary,
        hover: config.colors.primary + 'dd', // 87% opacity
      },
    },
    navigation: {
      ...geofencingColors.navigation,
      active: config.colors.primary,
      hover: config.colors.primary,
      primary: config.colors.primary,
    },
    accent: {
      ...geofencingColors.accent,
      blue: config.colors.primary,
      green: config.colors.success,
      orange: config.colors.warning,
      red: config.colors.error,
    },
  };
  
  return {
    colors: mergedColors,
    loading,
    error,
  };
};
