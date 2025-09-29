import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';
import { ThemeProvider } from 'styled-components';
import { Modal } from '../../design-system/components/Modal';

// Mock do tema
const mockTheme = {
  colors: {
    primary: '#29ABE2',
    secondary: '#1e8bc3',
    background: '#FFFFFF',
    surface: '#F8F9FA',
    text: '#2C3E50',
    border: '#E9ECEF',
  },
};

// Wrapper com tema
const ThemeWrapper = ({ children }: { children: React.ReactNode }) => (
  <ThemeProvider theme={mockTheme}>{children}</ThemeProvider>
);

describe('Design System Modal', () => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
    theme: mockTheme,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Renderização Básica', () => {
    it('deve renderizar o modal quando isOpen é true', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('não deve renderizar o modal quando isOpen é false', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} isOpen={false} />
        </ThemeWrapper>
      );

      expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
    });

    it('deve renderizar o título corretamente', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      const title = screen.getByRole('heading', { level: 2 });
      expect(title).toHaveTextContent('Test Modal');
    });

    it('deve renderizar o conteúdo do modal', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps}>
            <div data-testid='modal-content'>Conteúdo do Modal</div>
          </Modal>
        </ThemeWrapper>
      );

      expect(screen.getByTestId('modal-content')).toBeInTheDocument();
    });
  });

  describe('Interações', () => {
    it('deve chamar onClose quando o botão de fechar é clicado', () => {
      const onClose = jest.fn();
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} onClose={onClose} />
        </ThemeWrapper>
      );

      const closeButton = screen.getByLabelText('Fechar modal');
      fireEvent.click(closeButton);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('deve chamar onClose quando ESC é pressionado', async () => {
      const onClose = jest.fn();
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} onClose={onClose} />
        </ThemeWrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(onClose).toHaveBeenCalledTimes(1);
      });
    });

    it('deve chamar onClose quando clica no overlay', () => {
      const onClose = jest.fn();
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} onClose={onClose} />
        </ThemeWrapper>
      );

      const overlay = screen.getByRole('dialog').parentElement;
      fireEvent.click(overlay!);

      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('não deve chamar onClose quando clica no conteúdo do modal', () => {
      const onClose = jest.fn();
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} onClose={onClose} />
        </ThemeWrapper>
      );

      const modalContent = screen.getByRole('dialog');
      fireEvent.click(modalContent);

      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('Configurações de Comportamento', () => {
    it('não deve fechar com ESC quando closeOnEscape é false', async () => {
      const onClose = jest.fn();
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} onClose={onClose} closeOnEscape={false} />
        </ThemeWrapper>
      );

      fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });

      await waitFor(() => {
        expect(onClose).not.toHaveBeenCalled();
      });
    });

    it('não deve fechar com clique no overlay quando closeOnOverlayClick é false', () => {
      const onClose = jest.fn();
      render(
        <ThemeWrapper>
          <Modal
            {...defaultProps}
            onClose={onClose}
            closeOnOverlayClick={false}
          />
        </ThemeWrapper>
      );

      const overlay = screen.getByRole('dialog').parentElement;
      fireEvent.click(overlay!);

      expect(onClose).not.toHaveBeenCalled();
    });

    it('não deve mostrar botão de fechar quando showCloseButton é false', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} showCloseButton={false} />
        </ThemeWrapper>
      );

      expect(screen.queryByLabelText('Fechar modal')).not.toBeInTheDocument();
    });
  });

  describe('Footer', () => {
    it('deve renderizar o footer quando fornecido', () => {
      const footer = <div data-testid='modal-footer'>Footer Content</div>;
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} footer={footer} />
        </ThemeWrapper>
      );

      expect(screen.getByTestId('modal-footer')).toBeInTheDocument();
    });

    it('não deve renderizar o footer quando não fornecido', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      expect(screen.queryByTestId('modal-footer')).not.toBeInTheDocument();
    });
  });

  describe('Tamanhos e Layout', () => {
    it('deve aplicar maxWidth customizado', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} maxWidth='800px' />
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle('max-width: 800px');
    });

    it('deve aplicar width customizado', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} width='500px' />
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle('width: 500px');
    });

    it('deve aplicar height customizado', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} height='400px' />
        </ThemeWrapper>
      );

      const modal = screen.getByRole('dialog');
      expect(modal).toHaveStyle('height: 400px');
    });
  });

  describe('Acessibilidade', () => {
    it('deve ter role="dialog"', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('deve ter aria-label no botão de fechar', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      const closeButton = screen.getByLabelText('Fechar modal');
      expect(closeButton).toBeInTheDocument();
    });

    it('deve prevenir scroll do body quando modal está aberto', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      expect(document.body.style.overflow).toBe('hidden');
    });

    it('deve restaurar scroll do body quando modal é fechado', () => {
      const { unmount } = render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      unmount();

      expect(document.body.style.overflow).toBe('unset');
    });
  });

  describe('Temas', () => {
    it('deve aplicar cores do tema corretamente', () => {
      render(
        <ThemeWrapper>
          <Modal {...defaultProps} />
        </ThemeWrapper>
      );

      const header = screen.getByRole('heading', { level: 2 }).parentElement;
      expect(header).toHaveStyle(
        'background: linear-gradient(135deg, #29ABE2, #1e8bc3)'
      );
    });

    it('deve funcionar com tema diferente', () => {
      const customTheme = {
        colors: {
          primary: '#E74C3C',
          secondary: '#C0392B',
          background: '#FFFFFF',
          surface: '#FDF2F2',
          text: '#2C3E50',
          border: '#FADBD8',
        },
      };

      render(
        <ThemeProvider theme={customTheme}>
          <Modal {...defaultProps} theme={customTheme} />
        </ThemeProvider>
      );

      const header = screen.getByRole('heading', { level: 2 }).parentElement;
      expect(header).toHaveStyle(
        'background: linear-gradient(135deg, #E74C3C, #C0392B)'
      );
    });
  });
});
