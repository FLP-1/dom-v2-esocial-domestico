import React, { useState } from 'react';
import styled from 'styled-components';
import { useTheme } from '../../hooks/useTheme';
import { Button, Card, Input, Modal } from '../components';
import { colors } from '../tokens/colors';
import {
  OptimizedSectionTitle,
  OptimizedButtonGroup,
} from '../../components/shared/optimized-styles';

const DemoContainer = styled.div`
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  background: ${colors.gray50};
  min-height: 100vh;
`;

const Section = styled.section`
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1.5rem;
  color: ${colors.gray900};
`;

const ComponentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const ComponentDemo = styled(Card)`
  padding: 1.5rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const InputGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

interface DesignSystemDemoProps {
  profileType?: 'empregado' | 'empregador' | 'familia' | 'admin';
}

export const DesignSystemDemo: React.FC<DesignSystemDemoProps> = ({
  profileType = 'empregado',
}) => {
  const { theme } = useTheme(profileType);
  const [modalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  return (
    <DemoContainer>
      <OptimizedSectionTitle>
        <span role='img' aria-label='Arte'>
          🎨
        </span>{' '}
        Design System DOM - Demonstração
      </OptimizedSectionTitle>

      {/* Seção de Botões */}
      <Section>
        <OptimizedSectionTitle>Botões</OptimizedSectionTitle>

        <ComponentGrid>
          <ComponentDemo theme={theme}>
            <h3>Variações</h3>
            <OptimizedButtonGroup>
              <Button variant='primary' theme={theme}>
                Primary
              </Button>
              <Button variant='secondary' theme={theme}>
                Secondary
              </Button>
              <Button variant='success' theme={theme}>
                Success
              </Button>
              <Button variant='warning' theme={theme}>
                Warning
              </Button>
              <Button variant='danger' theme={theme}>
                Danger
              </Button>
              <Button variant='ghost' theme={theme}>
                Ghost
              </Button>
            </OptimizedButtonGroup>
          </ComponentDemo>

          <ComponentDemo theme={theme}>
            <h3>Tamanhos</h3>
            <OptimizedButtonGroup>
              <Button size='xs' theme={theme}>
                XS
              </Button>
              <Button size='sm' theme={theme}>
                Small
              </Button>
              <Button size='md' theme={theme}>
                Medium
              </Button>
              <Button size='lg' theme={theme}>
                Large
              </Button>
              <Button size='xl' theme={theme}>
                XL
              </Button>
            </OptimizedButtonGroup>
          </ComponentDemo>

          <ComponentDemo theme={theme}>
            <h3>Estados</h3>
            <OptimizedButtonGroup>
              <Button theme={theme}>Normal</Button>
              <Button loading theme={theme}>
                Loading
              </Button>
              <Button disabled theme={theme}>
                Disabled
              </Button>
              <Button fullWidth theme={theme}>
                Full Width
              </Button>
            </OptimizedButtonGroup>
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      {/* Seção de Inputs */}
      <Section>
        <OptimizedSectionTitle>Inputs</OptimizedSectionTitle>

        <ComponentGrid>
          <ComponentDemo theme={theme}>
            <h3>Variações</h3>
            <InputGroup>
              <Input
                placeholder='Input padrão'
                theme={theme}
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
              />
              <Input
                variant='filled'
                placeholder='Input preenchido'
                theme={theme}
              />
              <Input
                variant='outlined'
                placeholder='Input contornado'
                theme={theme}
              />
            </InputGroup>
          </ComponentDemo>

          <ComponentDemo theme={theme}>
            <h3>Estados</h3>
            <InputGroup>
              <Input
                state='default'
                placeholder='Estado normal'
                theme={theme}
              />
              <Input state='error' placeholder='Estado de erro' theme={theme} />
              <Input
                state='success'
                placeholder='Estado de sucesso'
                theme={theme}
              />
              <Input
                state='warning'
                placeholder='Estado de aviso'
                theme={theme}
              />
            </InputGroup>
          </ComponentDemo>

          <ComponentDemo theme={theme}>
            <h3>Tamanhos</h3>
            <InputGroup>
              <Input size='sm' placeholder='Pequeno' theme={theme} />
              <Input size='md' placeholder='Médio' theme={theme} />
              <Input size='lg' placeholder='Grande' theme={theme} />
            </InputGroup>
          </ComponentDemo>
        </ComponentGrid>
      </Section>

      {/* Seção de Cards */}
      <Section>
        <OptimizedSectionTitle>Cards</OptimizedSectionTitle>

        <ComponentGrid>
          <Card variant='default' theme={theme}>
            <h3>Card Padrão</h3>
            <p>Este é um card com estilo padrão do Design System.</p>
          </Card>

          <Card variant='outlined' theme={theme}>
            <h3>Card Contornado</h3>
            <p>Este card tem apenas borda, sem sombra.</p>
          </Card>

          <Card variant='filled' theme={theme}>
            <h3>Card Preenchido</h3>
            <p>Este card tem background colorido.</p>
          </Card>

          <Card variant='elevated' hoverable theme={theme}>
            <h3>Card Elevado</h3>
            <p>Este card tem sombra mais pronunciada e efeito hover.</p>
          </Card>
        </ComponentGrid>
      </Section>

      {/* Seção de Modal */}
      <Section>
        <OptimizedSectionTitle>Modal</OptimizedSectionTitle>

        <ComponentDemo theme={theme}>
          <h3>Modal do Design System</h3>
          <p>Clique no botão para ver o modal em ação:</p>
          <Button
            variant='primary'
            theme={theme}
            onClick={() => setModalOpen(true)}
          >
            Abrir Modal
          </Button>
        </ComponentDemo>
      </Section>

      {/* Modal de demonstração */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          <>
            <span role='img' aria-label='Arte'>
              🎨
            </span>{' '}
            Modal do Design System
          </>
        }
        theme={theme}
        footer={
          <>
            <Button
              variant='secondary'
              theme={theme}
              onClick={() => setModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant='primary'
              theme={theme}
              onClick={() => setModalOpen(false)}
            >
              Confirmar
            </Button>
          </>
        }
      >
        <p>Este é um exemplo de modal criado com o Design System DOM.</p>
        <p>
          Ele usa as cores do perfil <strong>{profileType}</strong> e mantém
          consistência visual com todo o sistema.
        </p>

        <InputGroup>
          <Input
            placeholder='Teste o input integrado'
            theme={theme}
            fullWidth
          />
        </InputGroup>
      </Modal>
    </DemoContainer>
  );
};

export default DesignSystemDemo;
