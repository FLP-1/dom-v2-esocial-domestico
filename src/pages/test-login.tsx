import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  font-size: 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #218838;
  }
  
  &:active {
    background: #1e7e34;
  }
`;

export default function TestLogin() {
  const handleLogin = async () => {
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
      
      const result = await response.json();
      console.log('Login result:', result);
      alert(`Login: ${response.status} - ${result.message || 'OK'}`);
    } catch (error) {
      console.error('Login error:', error);
      alert(`Erro: ${error.message}`);
    }
  };

  return (
    <Container>
      <Title>Teste de Login</Title>
      <Button onClick={handleLogin}>
        Testar Login (Francisco)
      </Button>
    </Container>
  );
}
