import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import styled from 'styled-components';

// Interface simples para TimeRecord
interface TimeRecord {
  id: string;
  type: string;
  time: string;
  location: string;
  wifi: string;
  timestamp: Date;
}

const Container = styled.div`
  padding: 2rem;
  font-family: Arial, sans-serif;
  max-width: 1200px;
  margin: 0 auto;
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 2rem;
  color: #2c3e50;
`;

const Center = styled.div`
  text-align: center;
  margin-bottom: 3rem;
`;

const Clock = styled.h2`
  font-size: 3rem;
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
  font-family: monospace;
`;

const DateText = styled.p`
  font-size: 1.25rem;
  color: #7f8c8d;
  margin: 0;
`;

const GridButtons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const Btn = styled.button<{ $bg: string }>`
  padding: 1rem;
  font-size: 1rem;
  background-color: ${p => p.$bg};
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
`;

const RecordsBox = styled.div`
  background-color: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const RecordsTitle = styled.h3`
  margin-top: 0;
  color: #2c3e50;
`;

const EmptyText = styled.p`
  color: #7f8c8d;
  font-style: italic;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
`;

const Bold = styled.span`
  font-weight: bold;
`;

const InfoBox = styled.div`
  background-color: #e9ecef;
  padding: 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #6c757d;
`;

export default function TimeClock() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeRecords, setTimeRecords] = useState<TimeRecord[]>([]);

  // Carregar registros existentes
  useEffect(() => {
    const loadRecords = async () => {
      try {
        const response = await fetch('/api/time-clock/records');
        if (response.ok) {
          const result = await response.json();
          const formattedRecords: TimeRecord[] = result.data.map((record: any) => ({
            id: record.id,
            type: record.tipo,
            time: new Date(record.dataHora).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            }),
            location: record.enderecoCompleto || 'Escritório',
            wifi: record.nomeRedeWiFi || 'WiFi',
            timestamp: new Date(record.dataHora),
          }));
          setTimeRecords(formattedRecords);
        }
      } catch (error) {
        console.error('Erro ao carregar registros:', error);
      }
    };

    loadRecords();
  }, []);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Handler para registrar ponto
  const handleTimeRecord = async (type: string) => {
    try {
      const response = await fetch('/api/time-clock/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: type,
          observacao: `Registro via interface web - ${type}`
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const now = new Date();
        const timeString = now.toLocaleTimeString('pt-BR', {
          hour: '2-digit',
          minute: '2-digit',
        });

        const newRecord: TimeRecord = {
          id: result.data.id,
          type,
          time: timeString,
          location: 'Escritório - Sala 101',
          wifi: 'Empresa_WiFi_5G',
          timestamp: now,
        };

        setTimeRecords(prev => [...prev, newRecord]);
        
        toast.success(`Ponto registrado com sucesso: ${timeString}`, {
          position: 'top-center',
          autoClose: 3000,
        });
      } else {
        throw new Error('Erro ao registrar ponto');
      }
    } catch (error) {
      console.error('Erro ao registrar ponto:', error);
      toast.error('Erro ao registrar ponto. Tente novamente.', {
        position: 'top-center',
        autoClose: 3000,
      });
    }
  };

  return (
    <Container>
      <Title>Controle de Ponto</Title>

      {/* Relógio Atual */}
      <Center>
        <Clock>
          {currentTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </Clock>
        <DateText>
          {currentTime.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </DateText>
      </Center>

      {/* Botões de Registro */}
      <GridButtons>
        <Btn $bg="#2E8B57" onClick={() => handleTimeRecord('entrada')}>
          <span role="img" aria-label="Entrada">🕐</span> Entrada
        </Btn>
        
        <Btn $bg="#4682B4" onClick={() => handleTimeRecord('saida_almoco')}>
          <span role="img" aria-label="Saída Almoço">🍽️</span> Saída Almoço
        </Btn>
        
        <Btn $bg="#4682B4" onClick={() => handleTimeRecord('retorno_almoco')}>
          <span role="img" aria-label="Retorno Almoço">🔄</span> Retorno Almoço
        </Btn>
        
        <Btn $bg="#FF6347" onClick={() => handleTimeRecord('saida')}>
          <span role="img" aria-label="Saída">🏠</span> Saída
        </Btn>
      </GridButtons>

      {/* Lista de Registros */}
      <RecordsBox>
        <RecordsTitle>Registros de Hoje</RecordsTitle>
        {timeRecords.length === 0 ? (
          <EmptyText>Nenhum registro ainda. Use os botões acima para registrar seu ponto.</EmptyText>
        ) : (
          <div>
            {timeRecords.map((record) => (
              <Row key={record.id}>
                <Bold>{record.type.replace('_', ' ').toUpperCase()}</Bold>
                <span>{record.time}</span>
              </Row>
            ))}
          </div>
        )}
      </RecordsBox>

      {/* Informações do Sistema */}
      <InfoBox>
        <p><strong>Localização:</strong> Escritório - Sala 101</p>
        <p><strong>WiFi:</strong> Empresa_WiFi_5G</p>
        <p><strong>Status:</strong> Sistema funcionando normalmente</p>
      </InfoBox>

      <ToastContainer
        position='top-center'
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme='light'
      />
    </Container>
  );
}