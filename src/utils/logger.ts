/**
 * Utilitário de logging condicional
 * Logs são exibidos apenas em desenvolvimento
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.log(...args);
    }
  },
  
  error: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(...args);
    }
  },
  
  warn: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.warn(...args);
    }
  },
  
  info: (...args: any[]) => {
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.info(...args);
    }
  },
  
  // Logs de geolocalização (sempre habilitados para debug)
  geo: (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.log('[GEO]', ...args);
  },
  
  // Logs de autenticação (sempre habilitados para segurança)
  auth: (...args: any[]) => {
    // eslint-disable-next-line no-console
    console.log('[AUTH]', ...args);
  }
};

export default logger;

