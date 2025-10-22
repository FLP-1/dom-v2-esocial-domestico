// Página de gestão de locais de trabalho
import React, { useState, useEffect } from 'react';
// import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { useGeofencingTheme } from '../../hooks/useGeofencingTheme';

interface LocalTrabalho {
  id: string;
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  raio: number;
  ativo: boolean;
  grupo: {
    id: string;
    nome: string;
  };
  empregador: {
    nomeCompleto: string;
  };
  criadoEm: string;
}

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
`;

const Title = styled.h1<{ $theme: any }>`
  color: ${props => props.$theme.colors.text.primary};
  margin: 0;
`;

const Button = styled.button<{ $theme: any }>`
  background: ${props => props.$theme.colors.button.primary.background};
  color: ${props => props.$theme.colors.button.primary.text};
  border: none;
  padding: 12px 24px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  
  &:hover {
    background: ${props => props.$theme.colors.button.primary.hover};
  }
`;

const Card = styled.div<{ $theme: any }>`
  background: ${props => props.$theme.colors.background.primary};
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
`;

const CardTitle = styled.h3<{ $theme: any }>`
  margin: 0;
  color: ${props => props.$theme.colors.text.primary};
`;

const StatusBadge = styled.span<{ $active: boolean; $theme: any }>`
  background: ${props => props.$active ? props.$theme.colors.status.success.background : props.$theme.colors.status.error.background};
  color: ${props => props.$active ? props.$theme.colors.status.success.text : props.$theme.colors.status.error.text};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
`;

const CardContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 15px;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.span<{ $theme: any }>`
  font-weight: bold;
  color: ${props => props.$theme.colors.text.secondary};
  font-size: 14px;
`;

const Value = styled.span<{ $theme: any }>`
  color: ${props => props.$theme.colors.text.primary};
  font-size: 16px;
`;

const Coordinates = styled.div<{ $theme: any }>`
  background: ${props => props.$theme.colors.background.secondary};
  padding: 10px;
  border-radius: 5px;
  font-family: monospace;
  font-size: 14px;
`;

const Actions = styled.div`
  display: flex;
  gap: 10px;
`;

const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' | 'danger'; $theme: any }>`
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  ${props => {
    switch (props.$variant) {
      case 'danger':
        return `
          background: ${props.$theme.colors.button.danger.background};
          color: ${props.$theme.colors.button.danger.text};
          &:hover { background: ${props.$theme.colors.button.danger.hover}; }
        `;
      case 'secondary':
        return `
          background: ${props.$theme.colors.button.secondary.background};
          color: ${props.$theme.colors.button.secondary.text};
          &:hover { background: ${props.$theme.colors.button.secondary.hover}; }
        `;
      default:
        return `
          background: ${props.$theme.colors.button.primary.background};
          color: ${props.$theme.colors.button.primary.text};
          &:hover { background: ${props.$theme.colors.button.primary.hover}; }
        `;
    }
  }}
`;

const Modal = styled.div<{ $show: boolean }>`
  display: ${props => props.$show ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  padding: 30px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2<{ $theme: any }>`
  margin: 0;
  color: ${props => props.$theme.colors.text.primary};
`;

const CloseButton = styled.button<{ $theme: any }>`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.$theme.colors.text.secondary};
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Input = styled.input<{ $theme: any }>`
  padding: 12px;
  border: 1px solid ${props => props.$theme.colors.border.primary};
  border-radius: 5px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$theme.colors.border.focus};
  }
`;

const Select = styled.select<{ $theme: any }>`
  padding: 12px;
  border: 1px solid ${props => props.$theme.colors.border.primary};
  border-radius: 5px;
  font-size: 16px;
  
  &:focus {
    outline: none;
    border-color: ${props => props.$theme.colors.border.focus};
  }
`;

const Loading = styled.div<{ $theme: any }>`
  text-align: center;
  padding: 40px;
  color: ${props => props.$theme.colors.text.secondary};
`;

const Error = styled.div<{ $theme: any }>`
  background: ${props => props.$theme.colors.status.error.background};
  color: ${props => props.$theme.colors.status.error.text};
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const EmptyState = styled.div<{ $theme: any }>`
  text-align: center;
  padding: 40px;
`;

const EmptyStateTitle = styled.h3<{ $theme: any }>`
  color: ${props => props.$theme.colors.text.primary};
  margin: 0 0 10px 0;
`;

const EmptyStateText = styled.p<{ $theme: any }>`
  color: ${props => props.$theme.colors.text.secondary};
  margin: 0;
`;

export default function LocaisTrabalho() {
  // TODO: Implementar autenticação adequada
  // const { data: session } = useSession();
  const router = useRouter();
  const { colors: theme, loading: themeLoading, error: themeError } = useGeofencingTheme();
  const [locais, setLocais] = useState<LocalTrabalho[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingLocal, setEditingLocal] = useState<LocalTrabalho | null>(null);
  const [grupos, setGrupos] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    nome: '',
    endereco: '',
    raio: 200,
    grupoId: ''
  });

  useEffect(() => {
    // TODO: Implementar autenticação adequada
    // if (!session) {
    //   router.push('/login');
    //   return;
    // }
    
    loadLocais();
    loadGrupos();
  }, [router]);

  const loadLocais = async () => {
    try {
      const response = await fetch('/api/geofencing/locais');
      if (response.ok) {
        const data = await response.json();
        setLocais(data.locais);
      } else {
        setError('Erro ao carregar locais');
      }
    } catch (err) {
      setError('Erro ao carregar locais');
    } finally {
      setLoading(false);
    }
  };

  const loadGrupos = async () => {
    try {
      const response = await fetch('/api/user/groups');
      if (response.ok) {
        const data = await response.json();
        setGrupos(data.grupos || []);
      }
    } catch (err) {
      console.error('Erro ao carregar grupos:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLocal ? '/api/geofencing/locais' : '/api/geofencing/locais';
      const method = editingLocal ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          ...(editingLocal && { id: editingLocal.id })
        }),
      });

      if (response.ok) {
        setShowModal(false);
        setEditingLocal(null);
        setFormData({ nome: '', endereco: '', raio: 200, grupoId: '' });
        loadLocais();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Erro ao salvar local');
      }
    } catch (err) {
      setError('Erro ao salvar local');
    }
  };

  const handleEdit = (local: LocalTrabalho) => {
    setEditingLocal(local);
    setFormData({
      nome: local.nome,
      endereco: local.endereco,
      raio: local.raio,
      grupoId: local.grupo.id
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm('Tem certeza que deseja excluir este local?')) return;
    
    try {
      const response = await fetch('/api/geofencing/locais', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id }),
      });

      if (response.ok) {
        loadLocais();
      } else {
        setError('Erro ao excluir local');
      }
    } catch (err) {
      setError('Erro ao excluir local');
    }
  };

  const openModal = () => {
    setEditingLocal(null);
    setFormData({ nome: '', endereco: '', raio: 200, grupoId: '' });
    setShowModal(true);
  };

  // Loading state para tema
  if (themeLoading || !theme) {
    return (
      <Container>
        <Loading $theme={theme || { colors: { text: { secondary: '#666' } } }}>Carregando tema...</Loading>
      </Container>
    );
  }

  if (loading) {
    return (
      <Container>
        <Loading $theme={theme}>Carregando locais de trabalho...</Loading>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title $theme={theme}><span role="img" aria-label="office">🏢</span> Locais de Trabalho</Title>
        <Button $theme={theme} onClick={openModal}>
          <span role="img" aria-label="plus">➕</span> Novo Local
        </Button>
      </Header>

      {error && <Error $theme={theme}>{error}</Error>}

      {locais.length === 0 ? (
        <Card $theme={theme}>
          <EmptyState $theme={theme}>
            <EmptyStateTitle $theme={theme}>Nenhum local de trabalho encontrado</EmptyStateTitle>
            <EmptyStateText $theme={theme}>Clique em &quot;Novo Local&quot; para adicionar o primeiro local de trabalho.</EmptyStateText>
          </EmptyState>
        </Card>
      ) : (
        locais.map((local) => (
          <Card key={local.id} $theme={theme}>
            <CardHeader>
              <CardTitle $theme={theme}>{local.nome}</CardTitle>
              <StatusBadge $active={local.ativo} $theme={theme}>
                {local.ativo ? 'Ativo' : 'Inativo'}
              </StatusBadge>
            </CardHeader>
            
            <CardContent>
              <InfoItem>
                <Label $theme={theme}>Endereço</Label>
                <Value $theme={theme}>{local.endereco}</Value>
              </InfoItem>
              
              <InfoItem>
                <Label $theme={theme}>Grupo</Label>
                <Value $theme={theme}>{local.grupo.nome}</Value>
              </InfoItem>
              
              <InfoItem>
                <Label $theme={theme}>Raio</Label>
                <Value $theme={theme}>{local.raio}m</Value>
              </InfoItem>
              
              <InfoItem>
                <Label $theme={theme}>Coordenadas</Label>
                <Coordinates $theme={theme}>
                  Lat: {local.latitude.toFixed(8)}<br/>
                  Lon: {local.longitude.toFixed(8)}
                </Coordinates>
              </InfoItem>
            </CardContent>
            
            <Actions>
              <ActionButton $theme={theme} onClick={() => handleEdit(local)}>
                <span role="img" aria-label="edit">✏️</span> Editar
              </ActionButton>
              <ActionButton 
                $variant="danger" 
                $theme={theme}
                onClick={() => handleDelete(local.id)}
              >
                <span role="img" aria-label="delete">🗑️</span> Excluir
              </ActionButton>
            </Actions>
          </Card>
        ))
      )}

      <Modal $show={showModal}>
        <ModalContent>
          <ModalHeader>
            <ModalTitle $theme={theme}>
              {editingLocal ? 'Editar Local' : 'Novo Local'}
            </ModalTitle>
            <CloseButton $theme={theme} onClick={() => setShowModal(false)}>
              ×
            </CloseButton>
          </ModalHeader>
          
          <Form onSubmit={handleSubmit}>
            <FormGroup>
              <Label $theme={theme}>Nome do Local</Label>
              <Input
                $theme={theme}
                type="text"
                value={formData.nome}
                onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                required
                placeholder="Ex: Escritório Central"
              />
            </FormGroup>
            
            <FormGroup>
              <Label $theme={theme}>Endereço</Label>
              <Input
                $theme={theme}
                type="text"
                value={formData.endereco}
                onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                required
                placeholder="Ex: Rua das Flores, 123, São Paulo, SP"
              />
            </FormGroup>
            
            <FormGroup>
              <Label $theme={theme}>Grupo</Label>
              <Select
                $theme={theme}
                value={formData.grupoId}
                onChange={(e) => setFormData({ ...formData, grupoId: e.target.value })}
                required
                aria-label="Selecionar grupo"
              >
                <option value="">Selecione um grupo</option>
                {grupos.map((grupo) => (
                  <option key={grupo.id} value={grupo.id}>
                    {grupo.nome}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            <FormGroup>
              <Label $theme={theme}>Raio (metros)</Label>
              <Input
                $theme={theme}
                type="number"
                value={formData.raio}
                onChange={(e) => setFormData({ ...formData, raio: parseInt(e.target.value) })}
                min="50"
                max="1000"
                required
              />
            </FormGroup>
            
            <Actions>
              <ActionButton $theme={theme} type="submit">
                {editingLocal ? 'Atualizar' : 'Criar'} Local
              </ActionButton>
              <ActionButton 
                type="button" 
                $variant="secondary"
                $theme={theme}
                onClick={() => setShowModal(false)}
              >
                Cancelar
              </ActionButton>
            </Actions>
          </Form>
        </ModalContent>
      </Modal>
    </Container>
  );
}
