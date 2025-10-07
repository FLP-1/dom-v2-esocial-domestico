import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 16px;
`;

const Result = styled.p`
  color: #666;
  background: #f8f9fa;
  padding: 12px;
  border-radius: 4px;
  border-left: 4px solid #007bff;
`;

export default function TestAPI() {
  const [result, setResult] = useState('');

  useEffect(() => {
    const testAPI = async () => {
      try {
        // Obter configurações dinâmicas
        const configResponse = await fetch('/api/config/system');
        const configData = await configResponse.json();
        const empresaConfig = configData.data;
        
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cpf: empresaConfig.empresa_cpf_principal,
            senha: empresaConfig.sistema_senha_padrao || 'senha123'
          })
        });
        
        const data = await response.json();
        setResult(`Status: ${response.status} - ${data.message || 'OK'}`);
      } catch (error) {
        setResult(`Erro: ${error.message}`);
      }
    };

    testAPI();
  }, []);

  return (
    <Container>
      <Title>Teste de API</Title>
      <Result>Resultado: {result}</Result>
    </Container>
  );
}
