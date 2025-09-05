// src/pages/dashboard.tsx
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import Layout from '../components/Layout';
import { ProfileProps } from '../types';

const DashboardContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const CardTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 1.2rem;
`;

const CardContent = styled.div`
  color: #666;
  line-height: 1.6;
`;

const ProfileInfo = styled.div`
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const ProfileName = styled.h2`
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
`;

const ProfileRole = styled.p`
  margin: 0;
  font-size: 1.1rem;
  opacity: 0.9;
`;

export default function Dashboard() {
  const router = useRouter();
  const { profileId } = router.query;

  const allProfiles: ProfileProps[] = useMemo(
    () => [
      {
        id: '1',
        nickname: 'João',
        role: 'Empregador',
        group: 'Casa',
        color: '#29ABE2',
      },
      {
        id: '2',
        nickname: 'Maria',
        role: 'Familiar',
        group: 'Família dos Pais',
        color: '#90EE90',
      },
      {
        id: '3',
        nickname: 'Pedro',
        role: 'Empregado',
        group: 'Jardineiro',
        color: '#FFDA63',
      },
    ],
    []
  );

  const [selectedProfile, setSelectedProfile] = useState<ProfileProps>(
    allProfiles[0] ?? {
      id: '1',
      nickname: 'Usuário',
      role: 'Empregador',
      group: 'Casa',
      color: '#29ABE2',
    }
  );

  useEffect(() => {
    // Certificando que profileId é uma string (ela pode vir como array)
    if (profileId && typeof profileId === 'string') {
      const p = allProfiles.find(p => p.id === profileId);
      // Só atualiza se o perfil encontrado for diferente do atual
      if (p && selectedProfile.id !== p.id) {
        setSelectedProfile(p);
      }
    }
  }, [profileId, allProfiles, selectedProfile]);

  const handleProfileChange = (id: string) => {
    const profile = allProfiles.find(p => p.id === id);
    if (profile) {
      setSelectedProfile(profile);
      router.push(`/dashboard?profileId=${id}`);
    }
  };

  return (
    <Layout
      profiles={allProfiles}
      selectedProfile={selectedProfile}
      onProfileChange={handleProfileChange}
      pageTitle='Dashboard'
      pageDescription={`Bem-vindo, ${selectedProfile.nickname}!`}
    >
      <ProfileInfo>
        <ProfileName>{selectedProfile.nickname}</ProfileName>
        <ProfileRole>{selectedProfile.role}</ProfileRole>
      </ProfileInfo>

      <DashboardContainer>
        <Card>
          <CardTitle>Resumo do Dia</CardTitle>
          <CardContent>
            <p>Bem-vindo ao seu dashboard personalizado!</p>
            <p>Perfil ativo: {selectedProfile.role}</p>
            <p>Grupo: {selectedProfile.group}</p>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Tarefas Pendentes</CardTitle>
          <CardContent>
            <p>Você tem 3 tarefas pendentes hoje.</p>
            <p>Próxima reunião: 14:00</p>
          </CardContent>
        </Card>

        <Card>
          <CardTitle>Estatísticas</CardTitle>
          <CardContent>
            <p>Horas trabalhadas hoje: 6h 30min</p>
            <p>Produtividade: 85%</p>
          </CardContent>
        </Card>
      </DashboardContainer>
    </Layout>
  );
}
