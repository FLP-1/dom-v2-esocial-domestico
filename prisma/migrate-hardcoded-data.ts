// Script de migração de dados hardcoded para banco de dados
// Este script migra TODOS os dados hardcoded identificados na auditoria

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateHardcodedData() {
  console.log('🚀 Iniciando migração de dados hardcoded...');

  try {
    // ========================================
    // 1. CONFIGURAÇÕES DE PERFIL
    // ========================================
    console.log('📋 Migrando configurações de perfil...');
    
    const perfis = [
      {
        nome: 'empregado',
        descricao: 'Empregado doméstico com acesso a funcionalidades de trabalho',
        corPrimaria: '#29ABE2',
        corSecundaria: '#90EE90',
        corAccent: '#FFDA63',
        corBackground: '#FFFFFF',
        corSurface: '#F8F9FA',
        corText: '#2C3E50',
        corTextSecondary: '#7F8C8D',
        corBorder: '#E9ECEF',
        corShadow: 'rgba(41, 171, 226, 0.1)',
        icone: 'worker',
        avatar: '👷',
      },
      {
        nome: 'empregador',
        descricao: 'Empregador com acesso a gestão completa',
        corPrimaria: '#E74C3C',
        corSecundaria: '#F39C12',
        corAccent: '#9B59B6',
        corBackground: '#FFFFFF',
        corSurface: '#FDF2F2',
        corText: '#2C3E50',
        corTextSecondary: '#7F8C8D',
        corBorder: '#FADBD8',
        corShadow: 'rgba(231, 76, 60, 0.1)',
        icone: 'business',
        avatar: '👔',
      },
      {
        nome: 'familia',
        descricao: 'Familiar com acesso a funcionalidades domésticas',
        corPrimaria: '#9B59B6',
        corSecundaria: '#E91E63',
        corAccent: '#FF9800',
        corBackground: '#FFFFFF',
        corSurface: '#F3E5F5',
        corText: '#2C3E50',
        corTextSecondary: '#7F8C8D',
        corBorder: '#E1BEE7',
        corShadow: 'rgba(155, 89, 182, 0.1)',
        icone: 'family',
        avatar: '👨‍👩‍👧‍👦',
      },
      {
        nome: 'admin',
        descricao: 'Administrador do sistema com acesso total',
        corPrimaria: '#34495E',
        corSecundaria: '#2ECC71',
        corAccent: '#F1C40F',
        corBackground: '#FFFFFF',
        corSurface: '#F4F6F7',
        corText: '#2C3E50',
        corTextSecondary: '#7F8C8D',
        corBorder: '#D5DBDB',
        corShadow: 'rgba(52, 73, 94, 0.1)',
        icone: 'admin',
        avatar: '⚙️',
      },
    ];

    for (const perfil of perfis) {
      await prisma.configuracaoPerfil.upsert({
        where: { nome: perfil.nome },
        update: perfil,
        create: perfil,
      });
    }

    // ========================================
    // 2. CONFIGURAÇÕES DE STATUS
    // ========================================
    console.log('📊 Migrando configurações de status...');
    
    const status = [
      // Status de Tarefas
      {
        nome: 'todo',
        descricao: 'Tarefa pendente',
        categoria: 'tarefa',
        corPrimaria: '#f59e0b',
        corBackground: '#fef3c7',
        corTexto: '#92400e',
        icone: '⏰',
        ordem: 1,
      },
      {
        nome: 'in-progress',
        descricao: 'Tarefa em andamento',
        categoria: 'tarefa',
        corPrimaria: '#3b82f6',
        corBackground: '#dbeafe',
        corTexto: '#1e40af',
        icone: '🔄',
        ordem: 2,
      },
      {
        nome: 'completed',
        descricao: 'Tarefa concluída',
        categoria: 'tarefa',
        corPrimaria: '#10b981',
        corBackground: '#d1fae5',
        corTexto: '#065f46',
        icone: '✅',
        ordem: 3,
      },
      // Status de Sistema
      {
        nome: 'online',
        descricao: 'Sistema online',
        categoria: 'sistema',
        corPrimaria: '#90EE90',
        corBackground: '#d4edda',
        corTexto: '#155724',
        icone: '🟢',
        ordem: 1,
      },
      {
        nome: 'warning',
        descricao: 'Aviso do sistema',
        categoria: 'sistema',
        corPrimaria: '#f39c12',
        corBackground: '#fff3cd',
        corTexto: '#856404',
        icone: '⚠️',
        ordem: 2,
      },
      {
        nome: 'error',
        descricao: 'Erro do sistema',
        categoria: 'sistema',
        corPrimaria: '#e74c3c',
        corBackground: '#f8d7da',
        corTexto: '#721c24',
        icone: '❌',
        ordem: 3,
      },
    ];

    for (const statusItem of status) {
      await prisma.configuracaoStatus.upsert({
        where: { nome: statusItem.nome },
        update: statusItem,
        create: statusItem,
      });
    }

    // ========================================
    // 3. CONFIGURAÇÕES DE PRIORIDADE
    // ========================================
    console.log('🎯 Migrando configurações de prioridade...');
    
    const prioridades = [
      {
        nome: 'high',
        descricao: 'Prioridade alta',
        corPrimaria: '#ef4444',
        corBackground: '#fef2f2',
        corTexto: '#dc2626',
        corBorder: '#ef4444',
        icone: '🔴',
        ordem: 1,
      },
      {
        nome: 'medium',
        descricao: 'Prioridade média',
        corPrimaria: '#f59e0b',
        corBackground: '#fffbeb',
        corTexto: '#d97706',
        corBorder: '#f59e0b',
        icone: '🟡',
        ordem: 2,
      },
      {
        nome: 'low',
        descricao: 'Prioridade baixa',
        corPrimaria: '#10b981',
        corBackground: '#f0fdf4',
        corTexto: '#059669',
        corBorder: '#10b981',
        icone: '🟢',
        ordem: 3,
      },
    ];

    for (const prioridade of prioridades) {
      await prisma.configuracaoPrioridade.upsert({
        where: { nome: prioridade.nome },
        update: prioridade,
        create: prioridade,
      });
    }

    // ========================================
    // 4. CONFIGURAÇÕES DE SISTEMA
    // ========================================
    console.log('⚙️ Migrando configurações de sistema...');
    
    const configuracoesSistema = [
      // Cores UI
      {
        chave: 'UI_THEME_PRIMARY',
        valor: '#3B82F6',
        descricao: 'Cor primária do tema UI',
        categoria: 'UI',
      },
      {
        chave: 'UI_THEME_SECONDARY',
        valor: '#6B7280',
        descricao: 'Cor secundária do tema UI',
        categoria: 'UI',
      },
      {
        chave: 'UI_SUCCESS',
        valor: '#10B981',
        descricao: 'Cor de sucesso',
        categoria: 'UI',
      },
      {
        chave: 'UI_WARNING',
        valor: '#F59E0B',
        descricao: 'Cor de aviso',
        categoria: 'UI',
      },
      {
        chave: 'UI_ERROR',
        valor: '#EF4444',
        descricao: 'Cor de erro',
        categoria: 'UI',
      },
      {
        chave: 'UI_INFO',
        valor: '#3B82F6',
        descricao: 'Cor de informação',
        categoria: 'UI',
      },
      // Cores de fallback
      {
        chave: 'UI_FALLBACK_PRIMARY',
        valor: '#29ABE2',
        descricao: 'Cor primária de fallback',
        categoria: 'UI',
      },
      {
        chave: 'UI_FALLBACK_SUCCESS',
        valor: '#90EE90',
        descricao: 'Cor de sucesso de fallback',
        categoria: 'UI',
      },
    ];

    for (const config of configuracoesSistema) {
      await prisma.configuracaoSistema.upsert({
        where: { chave: config.chave },
        update: config,
        create: config,
      });
    }

    // ========================================
    // 5. CONFIGURAÇÕES DE COMPONENTES
    // ========================================
    console.log('🧩 Migrando configurações de componentes...');
    
    const componentes = [
      {
        nome: 'Button',
        descricao: 'Componente de botão',
        borderRadius: '8px',
        padding: '0.75rem 1.5rem',
        margin: '0.5rem',
        fontSize: '1rem',
        fontWeight: '500',
        shadow: '0 2px 4px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        hoverEffect: 'translateY(-2px)',
      },
      {
        nome: 'Modal',
        descricao: 'Componente de modal',
        borderRadius: '16px',
        padding: '2rem',
        margin: '0',
        fontSize: '1rem',
        fontWeight: '400',
        shadow: '0 25px 50px rgba(0,0,0,0.25)',
        transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
        hoverEffect: 'none',
      },
      {
        nome: 'Card',
        descricao: 'Componente de card',
        borderRadius: '12px',
        padding: '1.5rem',
        margin: '1rem',
        fontSize: '1rem',
        fontWeight: '400',
        shadow: '0 4px 16px rgba(0,0,0,0.1)',
        transition: 'all 0.3s ease',
        hoverEffect: 'translateY(-4px)',
      },
    ];

    for (const componente of componentes) {
      await prisma.configuracaoComponente.upsert({
        where: { nome: componente.nome },
        update: componente,
        create: componente,
      });
    }

    // ========================================
    // 6. CONFIGURAÇÕES DE LAYOUT
    // ========================================
    console.log('📐 Migrando configurações de layout...');
    
    const layouts = [
      {
        nome: 'sidebar',
        descricao: 'Barra lateral do sistema',
        largura: '240px',
        altura: '100vh',
        minHeight: '100vh',
        maxWidth: '240px',
        position: 'fixed',
        top: '0',
        left: '0',
        right: 'auto',
        bottom: 'auto',
        padding: '1rem',
        margin: '0',
        gap: '1rem',
        background: '#ffffff',
        border: '1px solid #eee',
        borderRadius: '0',
        shadow: '0 2px 8px rgba(0,0,0,0.1)',
        mobileLargura: '100%',
        tabletLargura: '240px',
        desktopLargura: '240px',
      },
      {
        nome: 'header',
        descricao: 'Cabeçalho do sistema',
        largura: '100%',
        altura: '60px',
        minHeight: '60px',
        maxWidth: '100%',
        position: 'fixed',
        top: '0',
        left: '240px',
        right: '0',
        bottom: 'auto',
        padding: '1rem 2rem',
        margin: '0',
        gap: '1rem',
        background: '#ffffff',
        border: '1px solid #eee',
        borderRadius: '0',
        shadow: '0 2px 4px rgba(0,0,0,0.1)',
        mobileLargura: '100%',
        tabletLargura: '100%',
        desktopLargura: '100%',
      },
      {
        nome: 'main-content',
        descricao: 'Conteúdo principal',
        largura: '100%',
        altura: 'auto',
        minHeight: 'calc(100vh - 60px)',
        maxWidth: '1200px',
        position: 'relative',
        top: '60px',
        left: '240px',
        right: 'auto',
        bottom: 'auto',
        padding: '2rem',
        margin: '0 auto',
        gap: '2rem',
        background: '#f8f9fa',
        border: 'none',
        borderRadius: '0',
        shadow: 'none',
        mobileLargura: '100%',
        tabletLargura: '100%',
        desktopLargura: '100%',
      },
    ];

    for (const layout of layouts) {
      await prisma.configuracaoLayout.upsert({
        where: { nome: layout.nome },
        update: layout,
        create: layout,
      });
    }

    console.log('✅ Migração concluída com sucesso!');
    console.log('📊 Dados migrados:');
    console.log('   - 4 perfis de usuário');
    console.log('   - 6 status de sistema');
    console.log('   - 3 níveis de prioridade');
    console.log('   - 8 configurações de sistema');
    console.log('   - 3 componentes');
    console.log('   - 3 layouts');
    console.log('   Total: 27 configurações centralizadas');

  } catch (error) {
    console.error('❌ Erro na migração:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Executar migração
if (require.main === module) {
  migrateHardcodedData()
    .then(() => {
      console.log('🎉 Migração finalizada!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Falha na migração:', error);
      process.exit(1);
    });
}

export default migrateHardcodedData;
