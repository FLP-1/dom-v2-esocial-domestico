import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 20px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Title = styled.h1`
  color: #333;
  margin-bottom: 16px;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  
  &:hover {
    background: #0056b3;
  }
`;

export default function TestSimpleAPI() {
  return (
    <Container>
      <Title>Teste Simples de API</Title>
      <Description>Se esta página carregar, o problema é específico do time-clock.tsx</Description>
      <Button onClick={() => {
        // Obter configurações dinâmicas
        const configResponse = await fetch('/api/config/system');
        const configData = await configResponse.json();
        const empresaConfig = configData.data;
        
        fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            cpf: empresaConfig.empresa_cpf_principal, 
            senha: empresaConfig.sistema_senha_padrao || 'senha123'
          })
        })
        .then(res => res.json())
        .then(data => alert(`Status: ${data.message || 'OK'}`))
        .catch(err => alert(`Erro: ${err.message}`));
      }}>
        Testar Login
      </Button>
    </Container>
  );
}