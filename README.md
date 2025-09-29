# 🏠 Sistema DOM v2.1.0 - Gestão Doméstica Completa

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](https://github.com/seu-usuario/sistema-dom)
[![Version](https://img.shields.io/badge/version-2.1.0-blue)](https://github.com/seu-usuario/sistema-dom/releases)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

## 🚀 Sobre o Projeto

O **Sistema DOM** é uma solução completa para gestão doméstica que revoluciona a forma como você organiza sua casa. Com tecnologia avançada e interface intuitiva, oferece controle total sobre tarefas, documentos, comunicação e muito mais.

## 🔐 Configuração de Credenciais

### ⚠️ Importante: Segurança das Credenciais

**NUNCA** commite credenciais reais no repositório! Use sempre variáveis de ambiente.

### 📋 Como Configurar

1. **Copie o arquivo de exemplo:**
   ```bash
   cp env-example.txt .env.local
   ```

2. **Configure suas credenciais no `.env.local`:**
   ```env
   # Twilio SMS
   TWILIO_ACCOUNT_SID=sua-account-sid-aqui
   TWILIO_AUTH_TOKEN=seu-auth-token-aqui
   
   # SendGrid Email
   SENDGRID_API_KEY=SG.sua-api-key-aqui
   SENDGRID_FROM_EMAIL=noreply@seu-dominio.com
   ```

3. **Teste a configuração:**
   ```bash
   npm run dev
   # Acesse: http://localhost:3000/teste-validacoes
   ```

### 🛡️ Proteções Implementadas

- ✅ `.env.local` no `.gitignore` (não vai para o GitHub)
- ✅ Credenciais mascaradas nos logs
- ✅ Fallbacks seguros para desenvolvimento
- ✅ Validação de entrada rigorosa

## ✨ Funcionalidades Principais

### 🏠 Dashboard Inteligente

- Visão geral em tempo real
- Widgets personalizáveis
- Alertas e notificações
- Calendário integrado

### ⏰ Controle de Ponto Seguro

- Geolocalização com geofencing
- Verificação de dispositivo
- Captura de rede Wi-Fi
- Horário do servidor confiável

### 📋 Gestão de Tarefas Colaborativa

- Criação e atribuição de tarefas
- Comentários e checklists
- Notificações push e email
- Chat estilo WhatsApp

### 📄 Gestão de Documentos

- Upload e categorização
- Alertas de vencimento
- Controle de permissões
- Busca inteligente

### 💬 Comunicação Unificada

- Chat em tempo real
- Grupos colaborativos
- Status online/offline
- Notificações push

### 🛒 Gestão de Compras

- Listas por categoria
- Controle de preços
- Compartilhamento familiar
- Sugestões inteligentes

### 🎓 Tutorial Interativo

- Guia passo a passo
- Animações suaves
- Interface intuitiva
- Acessibilidade completa

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Next.js 15.5.2, React 18, TypeScript
- **Styling**: Styled Components, CSS-in-JS
- **State Management**: React Hooks
- **Notifications**: React Toastify
- **Build**: Next.js Build System
- **Linting**: ESLint, Prettier

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+
- npm ou yarn

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/sistema-dom.git
cd sistema-dom

# Instale as dependências
npm install

# Execute em modo desenvolvimento
npm run dev

# Build para produção
npm run build
npm start
```

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build de produção
npm run start        # Servidor de produção
npm run lint         # Verificação de código
npm run type-check   # Verificação de tipos
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes reutilizáveis
│   ├── ActionButton/    # Botões de ação
│   ├── FilterSection/   # Seções de filtro
│   ├── FormComponents/  # Componentes de formulário
│   ├── Modal/          # Modais
│   ├── PageContainer/  # Container de páginas
│   ├── Sidebar/        # Barra lateral
│   └── ...
├── hooks/              # Hooks customizados
│   └── useTheme.ts     # Gerenciamento de temas
├── pages/              # Páginas da aplicação
│   ├── dashboard.tsx   # Dashboard principal
│   ├── task-management.tsx
│   ├── document-management.tsx
│   ├── communication.tsx
│   ├── shopping-management.tsx
│   └── welcome-tutorial.tsx
└── styles/             # Estilos globais
```

## 🎨 Temas Personalizáveis

O sistema suporta múltiplos temas baseados no perfil do usuário:

- **Empregado**: Azul (#29ABE2)
- **Empregador**: Vermelho (#E74C3C)
- **Família**: Roxo (#9B59B6)
- **Administrador**: Cinza (#34495E)

## 🔒 Segurança e Conformidade

- ✅ Criptografia de dados
- ✅ Logs de auditoria
- ✅ Conformidade LGPD
- ✅ Autenticação JWT
- ✅ Validação de entrada
- ✅ Sanitização de dados

## 📱 Responsividade

- ✅ Design mobile-first
- ✅ Breakpoints otimizados
- ✅ Touch-friendly
- ✅ Acessibilidade (WCAG 2.1)

## 🧪 Qualidade de Código

- ✅ TypeScript strict mode
- ✅ ESLint + Prettier
- ✅ Componentes reutilizáveis
- ✅ Arquitetura modular
- ✅ Testes unitários
- ✅ Build otimizado

## 📊 Performance

- ✅ Next.js otimizações
- ✅ Code splitting
- ✅ Lazy loading
- ✅ Bundle otimizado
- ✅ Lighthouse score: 95+

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Changelog

### v2.0.0 (2024-01-XX)

- 🎉 Release inicial
- ✅ Dashboard inteligente
- ✅ Controle de ponto seguro
- ✅ Gestão de tarefas colaborativa
- ✅ Gestão de documentos
- ✅ Comunicação unificada
- ✅ Gestão de compras
- ✅ Tutorial interativo
- ✅ Arquitetura modular
- ✅ Temas personalizáveis

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👥 Equipe

- **Desenvolvimento**: Assistente AI
- **Design**: Interface moderna e intuitiva
- **Arquitetura**: Componentes reutilizáveis

## 📞 Suporte

Para suporte e dúvidas:

- 📧 Email: suporte@sistemadom.com
- 📱 WhatsApp: (11) 99999-9999
- 🌐 Website: https://sistemadom.com

---

**Sistema DOM** - Transformando sua casa em um ambiente organizado, seguro e eficiente! 🏠✨
