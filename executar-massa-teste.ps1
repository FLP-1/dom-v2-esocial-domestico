# Script PowerShell para executar a massa de teste completa
# Usuário Empregador: 59876913700 com 2 empregados

Write-Host "🚀 EXECUTANDO MASSA DE TESTE COMPLETA" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green

# Garantir DATABASE_URL correto (banco 'dom')
$env:DATABASE_URL = "postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"
Write-Host "🔗 DATABASE_URL: $env:DATABASE_URL" -ForegroundColor Gray

# Verificar se o Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale o Node.js primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o npm está instalado
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
    Write-Host "❌ npm não encontrado. Instale o npm primeiro." -ForegroundColor Red
    exit 1
}

# Verificar se o banco de dados está rodando
Write-Host "🔍 Verificando conexão com o banco de dados..." -ForegroundColor Yellow
try {
    $dbTest = node -e "const { PrismaClient } = require('@prisma/client'); const prisma = new PrismaClient(); prisma.\$connect().then(() => { console.log('✅ Banco conectado'); prisma.\$disconnect(); }).catch(err => { console.log('❌ Erro:', err.message); process.exit(1); });"
    Write-Host $dbTest -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao conectar com o banco de dados. Verifique se o PostgreSQL está rodando." -ForegroundColor Red
    exit 1
}

# Executar migração do banco se necessário
Write-Host "🔄 Executando migração do banco de dados..." -ForegroundColor Yellow
try {
    npx prisma migrate dev --name massa_teste
    Write-Host "✅ Migração executada com sucesso" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Migração já está atualizada ou erro não crítico" -ForegroundColor Yellow
}

# Gerar cliente Prisma
Write-Host "🔧 Gerando cliente Prisma..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Cliente Prisma gerado" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro ao gerar cliente Prisma" -ForegroundColor Red
    exit 1
}

# Executar script de criação da massa de teste
Write-Host "📊 Criando massa de dados de teste..." -ForegroundColor Yellow
try {
    node criar-massa-teste-completa.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Massa de dados criada com sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao criar massa de dados" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao executar script de massa de teste" -ForegroundColor Red
    exit 1
}

# Criar arquivos de upload simulados
Write-Host "📁 Criando arquivos de upload simulados..." -ForegroundColor Yellow
try {
    node criar-arquivos-upload-teste.js
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Arquivos de upload criados com sucesso" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro ao criar arquivos de upload" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erro ao executar script de arquivos de upload" -ForegroundColor Red
    exit 1
}

# Verificar dados criados
Write-Host "🔍 Verificando dados criados..." -ForegroundColor Yellow
try {
    $verificacao = node -e "
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    async function verificar() {
        const usuarios = await prisma.usuario.count();
        const registros = await prisma.registroPontoNovo.count();
        const documentos = await prisma.documento.count();
        const dispositivos = await prisma.dispositivo.count();
        const configs = await prisma.configuracaoSistema.count();
        
        console.log('📊 RESUMO DOS DADOS CRIADOS:');
        console.log('👤 Usuários:', usuarios);
        console.log('⏰ Registros de ponto:', registros);
        console.log('📄 Documentos:', documentos);
        console.log('📱 Dispositivos:', dispositivos);
        console.log('⚙️ Configurações:', configs);
        
        await prisma.\$disconnect();
    }
    
    verificar().catch(console.error);
    "
    Write-Host $verificacao -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erro ao verificar dados, mas continuando..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 MASSA DE TESTE EXECUTADA COM SUCESSO!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "🔑 CREDENCIAIS PARA TESTE:" -ForegroundColor Cyan
Write-Host "👤 Empregador: CPF 59876913700 | Senha: 123456" -ForegroundColor White
Write-Host "👤 Empregado 1: CPF 12345678901 | Senha: 123456" -ForegroundColor White
Write-Host "👤 Empregado 2: CPF 98765432109 | Senha: 123456" -ForegroundColor White
Write-Host ""
Write-Host "📊 DADOS DISPONÍVEIS:" -ForegroundColor Cyan
Write-Host "• 45 dias de registros de ponto para cada empregado" -ForegroundColor White
Write-Host "• 8 documentos por empregado (atestados, comprovantes, etc.)" -ForegroundColor White
Write-Host "• Dispositivos móveis cadastrados" -ForegroundColor White
Write-Host "• Configurações do sistema" -ForegroundColor White
Write-Host "• Dados da empresa" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Sistema pronto para testes completos!" -ForegroundColor Green
Write-Host ""
Write-Host "Para iniciar o servidor de desenvolvimento:" -ForegroundColor Yellow
Write-Host "npm run dev" -ForegroundColor White
