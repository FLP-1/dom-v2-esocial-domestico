import { useCallback } from 'react';
import { toast } from 'react-toastify';

export interface AlertConfig {
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
  showIcon?: boolean;
}

export interface AlertManager {
  showSuccess: (message: string, title?: string) => void;
  showError: (message: string, title?: string) => void;
  showWarning: (message: string, title?: string) => void;
  showInfo: (message: string, title?: string) => void;
  showAlert: (config: AlertConfig) => void;
}

export const useAlertManager = (): AlertManager => {
  const showAlert = useCallback((config: AlertConfig) => {
    const { type, title, message, duration = 5000, showIcon = true } = config;

    const icon = showIcon ? getIconForType(type) : '';
    const fullMessage = title
      ? `${icon} ${title}: ${message}`
      : `${icon} ${message}`;

    switch (type) {
      case 'success':
        toast.success(fullMessage, {
          position: 'top-right',
          autoClose: duration,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'error':
        toast.error(fullMessage, {
          position: 'top-right',
          autoClose: duration,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'warning':
        toast.warning(fullMessage, {
          position: 'top-right',
          autoClose: duration,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
      case 'info':
        toast.info(fullMessage, {
          position: 'top-right',
          autoClose: duration,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        break;
    }
  }, []);

  const showSuccess = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'success', message, title });
    },
    [showAlert]
  );

  const showError = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'error', message, title });
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'warning', message, title });
    },
    [showAlert]
  );

  const showInfo = useCallback(
    (message: string, title?: string) => {
      showAlert({ type: 'info', message, title });
    },
    [showAlert]
  );

  return {
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showAlert,
  };
};

const getIconForType = (type: AlertConfig['type']): string => {
  switch (type) {
    case 'success':
      return '✅';
    case 'error':
      return '❌';
    case 'warning':
      return '⚠️';
    case 'info':
      return 'ℹ️';
    default:
      return '';
  }
};

export default useAlertManager;
