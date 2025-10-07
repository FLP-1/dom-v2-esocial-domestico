import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Interface simples para TimeRecord
interface TimeRecord {
  id: string;
  type: string;
  time: string;
  location: string;
  wifi: string;
  timestamp: Date;
}

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
    <div style={{ 
      padding: '2rem', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      <h1 style={{ textAlign: 'center', marginBottom: '2rem', color: '#2c3e50' }}>
        Controle de Ponto
      </h1>

      {/* Relógio Atual */}
      <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h2 style={{ 
          fontSize: '3rem', 
          margin: '0 0 0.5rem 0', 
          color: '#2c3e50',
          fontFamily: 'monospace'
        }}>
          {currentTime.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          })}
        </h2>
        <p style={{ 
          fontSize: '1.25rem', 
          color: '#7f8c8d', 
          margin: 0 
        }}>
          {currentTime.toLocaleDateString('pt-BR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Botões de Registro */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button 
          onClick={() => handleTimeRecord('entrada')}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            backgroundColor: '#2E8B57',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🕐 Entrada
        </button>
        
        <button 
          onClick={() => handleTimeRecord('saida_almoco')}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            backgroundColor: '#4682B4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🍽️ Saída Almoço
        </button>
        
        <button 
          onClick={() => handleTimeRecord('retorno_almoco')}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            backgroundColor: '#4682B4',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🔄 Retorno Almoço
        </button>
        
        <button 
          onClick={() => handleTimeRecord('saida')}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            backgroundColor: '#FF6347',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          🏠 Saída
        </button>
      </div>

      {/* Lista de Registros */}
      <div style={{ 
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        marginBottom: '2rem'
      }}>
        <h3 style={{ marginTop: 0, color: '#2c3e50' }}>Registros de Hoje</h3>
        {timeRecords.length === 0 ? (
          <p style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
            Nenhum registro ainda. Use os botões acima para registrar seu ponto.
          </p>
        ) : (
          <div>
            {timeRecords.map((record) => (
              <div key={record.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0.5rem 0',
                borderBottom: '1px solid #dee2e6'
              }}>
                <span style={{ fontWeight: 'bold' }}>
                  {record.type.replace('_', ' ').toUpperCase()}
                </span>
                <span>{record.time}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Informações do Sistema */}
      <div style={{ 
        backgroundColor: '#e9ecef',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '0.9rem',
        color: '#6c757d'
      }}>
        <p><strong>Localização:</strong> Escritório - Sala 101</p>
        <p><strong>WiFi:</strong> Empresa_WiFi_5G</p>
        <p><strong>Status:</strong> Sistema funcionando normalmente</p>
      </div>

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
    </div>
  );
}