/**
 * Dashboard de Monitoramento Antifraude
 * Página administrativa para visualizar estatísticas e riscos
 */

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useTheme } from '../../hooks/useTheme';
import { useUserProfile } from '../../contexts/UserProfileContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.background?.secondary || '#f5f7fa'};
  padding: 2rem;
`;

const Header = styled.div`
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme?.text?.dark || '#1a202c'};
  margin-bottom: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: ${props => props.theme?.text?.secondary || '#718096'};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  border-left: 4px solid ${props => {
    switch (props.variant) {
      case 'success': return props.theme?.status?.success?.color || '#48bb78';
      case 'warning': return props.theme?.status?.warning?.color || '#ed8936';
      case 'danger': return props.theme?.status?.error?.color || '#f56565';
      case 'info': return props.theme?.status?.info?.color || '#4299e1';
      default: return props.theme?.text?.secondary || '#cbd5e0';
    }
  }};
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: ${props => props.theme?.text?.secondary || '#718096'};
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: ${props => props.theme?.text?.dark || '#1a202c'};
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 0.25rem;
`;

const Section = styled.div`
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: ${props => props.theme?.text?.dark || '#1a202c'};
  margin-bottom: 1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  text-align: left;
  padding: 0.75rem;
  background: #f7fafc;
  border-bottom: 2px solid #e2e8f0;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
`;

const Td = styled.td`
  padding: 0.75rem;
  border-bottom: 1px solid #e2e8f0;
  font-size: 0.875rem;
  color: #2d3748;
`;

const Badge = styled.span<{ variant?: 'success' | 'warning' | 'danger' | 'info' }>`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  background: ${props => {
    switch (props.variant) {
      case 'success': return '#c6f6d5';
      case 'warning': return '#feebc8';
      case 'danger': return '#fed7d7';
      case 'info': return '#bee3f8';
      default: return '#e2e8f0';
    }
  }};
  color: ${props => {
    switch (props.variant) {
      case 'success': return '#22543d';
      case 'warning': return '#7c2d12';
      case 'danger': return '#742a2a';
      case 'info': return '#2c5282';
      default: return '#2d3748';
    }
  }};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
`;

const ErrorContainer = styled.div`
  background: #fed7d7;
  color: #742a2a;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
`;

interface Estatisticas {
  totais: {
    analises: number;
    analisesHoje: number;
    analisesSemana: number;
    dispositivosUnicos: number;
    ipsUnicos: number;
  };
  deteccoes: {
    altoRisco: number;
    bloqueadas: number;
    dispositivosNovos: number;
    ipsNovos: number;
    vpns: number;
    bots: number;
    velocidadesImpossiveis: number;
  };
  taxas: {
    bloqueio: number;
    altoRisco: number;
  };
  distribuicao: {
    porNivelRisco: Array<{ nivel: string; quantidade: number }>;
  };
  topIPs: Array<{
    ipAddress: string;
    vezesVisto: number;
    pais: string | null;
    cidade: string | null;
    isVPN: boolean;
    isProxy: boolean;
    isDatacenter: boolean;
    bloqueado: boolean;
  }>;
}

export default function AntifaudeDashboard() {
  const { currentProfile } = useUserProfile();
  const { colors: theme } = useTheme(currentProfile?.role.toLowerCase());
  const [estatisticas, setEstatisticas] = useState<Estatisticas | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function carregarEstatisticas() {
      try {
        const response = await fetch('/api/antifraude/estatisticas');
        
        if (!response.ok) {
          throw new Error('Falha ao carregar estatísticas');
        }

        const data = await response.json();
        setEstatisticas(data.estatisticas);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
        setErro(error instanceof Error ? error.message : 'Erro desconhecido');
      } finally {
        setCarregando(false);
      }
    }

    carregarEstatisticas();
  }, []);

  if (carregando) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Carregando estatísticas...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (erro || !estatisticas) {
    return (
      <PageContainer>
        <ErrorContainer>
          <strong>Erro:</strong> {erro || 'Não foi possível carregar as estatísticas'}
        </ErrorContainer>
      </PageContainer>
    );
  }

  return (
    <>
      <Head>
        <title>Dashboard Antifraude - DOM</title>
      </Head>

      <PageContainer>
        <Header>
          <Title><span role="img" aria-label="Escudo">🛡️</span> Dashboard Antifraude</Title>
          <Subtitle>Monitoramento em tempo real de segurança e detecção de fraudes</Subtitle>
        </Header>

        <StatsGrid>
          <StatCard variant="info">
            <StatLabel>Total de Análises</StatLabel>
            <StatValue>{estatisticas.totais.analises.toLocaleString()}</StatValue>
            <StatSubtext>
              {estatisticas.totais.analisesHoje} hoje • {estatisticas.totais.analisesSemana} esta semana
            </StatSubtext>
          </StatCard>

          <StatCard variant="danger">
            <StatLabel>Alto Risco</StatLabel>
            <StatValue>{estatisticas.deteccoes.altoRisco.toLocaleString()}</StatValue>
            <StatSubtext>
              {estatisticas.taxas.altoRisco.toFixed(2)}% do total
            </StatSubtext>
          </StatCard>

          <StatCard variant="warning">
            <StatLabel>Bloqueadas</StatLabel>
            <StatValue>{estatisticas.deteccoes.bloqueadas.toLocaleString()}</StatValue>
            <StatSubtext>
              {estatisticas.taxas.bloqueio.toFixed(2)}% taxa de bloqueio
            </StatSubtext>
          </StatCard>

          <StatCard variant="success">
            <StatLabel>Dispositivos Únicos</StatLabel>
            <StatValue>{estatisticas.totais.dispositivosUnicos.toLocaleString()}</StatValue>
            <StatSubtext>
              {estatisticas.deteccoes.dispositivosNovos} novos recentemente
            </StatSubtext>
          </StatCard>
        </StatsGrid>

        <StatsGrid>
          <StatCard>
            <StatLabel>VPNs Detectadas</StatLabel>
            <StatValue>{estatisticas.deteccoes.vpns.toLocaleString()}</StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Bots Detectados</StatLabel>
            <StatValue>{estatisticas.deteccoes.bots.toLocaleString()}</StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>IPs Únicos</StatLabel>
            <StatValue>{estatisticas.totais.ipsUnicos.toLocaleString()}</StatValue>
          </StatCard>

          <StatCard>
            <StatLabel>Velocidades Impossíveis</StatLabel>
            <StatValue>{estatisticas.deteccoes.velocidadesImpossiveis.toLocaleString()}</StatValue>
          </StatCard>
        </StatsGrid>

        <Section>
          <SectionTitle>Distribuição por Nível de Risco</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>Nível</Th>
                <Th>Quantidade</Th>
                <Th>Porcentagem</Th>
              </tr>
            </thead>
            <tbody>
              {estatisticas.distribuicao.porNivelRisco.map(item => {
                const porcentagem = (item.quantidade / estatisticas.totais.analises * 100).toFixed(2);
                let variant: 'success' | 'info' | 'warning' | 'danger' = 'info';
                
                if (item.nivel === 'BAIXO') variant = 'success';
                else if (item.nivel === 'MEDIO') variant = 'warning';
                else if (item.nivel === 'ALTO' || item.nivel === 'CRITICO') variant = 'danger';

                return (
                  <tr key={item.nivel}>
                    <Td>
                      <Badge variant={variant}>{item.nivel}</Badge>
                    </Td>
                    <Td>{item.quantidade.toLocaleString()}</Td>
                    <Td>{porcentagem}%</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
        </Section>

        <Section>
          <SectionTitle>Top 10 IPs Mais Vistos</SectionTitle>
          <Table>
            <thead>
              <tr>
                <Th>IP</Th>
                <Th>Localização</Th>
                <Th>Visitas</Th>
                <Th>Tipo</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {estatisticas.topIPs.map(ip => (
                <tr key={ip.ipAddress}>
                  <Td>{ip.ipAddress}</Td>
                  <Td>{ip.cidade && ip.pais ? `${ip.cidade}, ${ip.pais}` : 'N/D'}</Td>
                  <Td>{ip.vezesVisto.toLocaleString()}</Td>
                  <Td>
                    {ip.isVPN && <Badge variant="warning">VPN</Badge>}
                    {ip.isProxy && <Badge variant="warning">Proxy</Badge>}
                    {ip.isDatacenter && <Badge variant="info">Datacenter</Badge>}
                    {!ip.isVPN && !ip.isProxy && !ip.isDatacenter && (
                      <Badge variant="success">Normal</Badge>
                    )}
                  </Td>
                  <Td>
                    {ip.bloqueado ? (
                      <Badge variant="danger">Bloqueado</Badge>
                    ) : (
                      <Badge variant="success">Permitido</Badge>
                    )}
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Section>
      </PageContainer>
    </>
  );
}

