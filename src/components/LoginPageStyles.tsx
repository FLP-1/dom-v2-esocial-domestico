import React from 'react';
import { SystemConfig } from '../hooks/useSystemConfig';

interface LoginPageStylesProps {
  config: SystemConfig;
}

export const LoginPageStyles: React.FC<LoginPageStylesProps> = ({ config }) => {
  const { colors } = config;
  
  return (
    <style dangerouslySetInnerHTML={{
      __html: `
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        html, body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%);
          font-family: 'Roboto', sans-serif;
          min-height: 100vh;
          overflow-x: hidden;
        }
        #__next {
          min-height: 100vh;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%);
          margin: 0;
          padding: 0;
        }
        
        /* CSS inline para PageContainer - evitar tela branca */
        [data-page-container] {
          min-height: 100vh !important;
          background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 50%, ${colors.primary} 100%) !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          padding: 20px !important;
        }
        
        /* Garantir que o background seja aplicado mesmo com CSS conflicts */
        body, html, #__next, [data-page-container] {
          background-attachment: fixed !important;
        }
      `
    }} />
  );
};
