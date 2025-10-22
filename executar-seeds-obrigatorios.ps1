# Script PowerShell para executar seeds obrigatórios
# Elimina dados hardcoded do sistema

Write-Host "🚀 EXECUTANDO SEEDS OBRIGATÓRIOS" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: Execute este script na raiz do projeto" -ForegroundColor Red
    exit 1
}

# Verificar se Node.js está instalado
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js detectado: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Node.js não encontrado" -ForegroundColor Red
    exit 1
}

# Verificar se Prisma está instalado
try {
    $prismaVersion = npx prisma --version
    Write-Host "✅ Prisma detectado" -ForegroundColor Green
} catch {
    Write-Host "❌ ERRO: Prisma não encontrado" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📡 Verificando conexão com banco de dados..." -ForegroundColor Yellow

# Verificar se DATABASE_URL está configurada
if (-not $env:DATABASE_URL) {
    Write-Host "❌ ERRO: DATABASE_URL não configurada" -ForegroundColor Red
    Write-Host "Configure a variável DATABASE_URL no arquivo .env.local" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green

Write-Host ""
Write-Host "🌱 Executando seeds..." -ForegroundColor Yellow

try {
    # Executar seed de configurações
    Write-Host "⚙️  Criando configurações obrigatórias..." -ForegroundColor Cyan
    npx ts-node prisma/seeds/seed-configuracoes-obrigatorias.ts
    
    if ($LASTEXITCODE -ne 0) {
        throw "Erro ao executar seed de configurações"
    }
    
    Write-Host "✅ Configurações criadas com sucesso" -ForegroundColor Green
    
    # Executar seed de termos
    Write-Host "📋 Criando termos e políticas..." -ForegroundColor Cyan
    npx ts-node prisma/seeds/seed-termos-politicas.ts
    
    if ($LASTEXITCODE -ne 0) {
        throw "Erro ao executar seed de termos"
    }
    
    Write-Host "✅ Termos e políticas criados com sucesso" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "🎉 SEEDS EXECUTADOS COM SUCESSO!" -ForegroundColor Green
    Write-Host "=================================" -ForegroundColor Green
    Write-Host "✅ Dados hardcoded eliminados" -ForegroundColor Green
    Write-Host "✅ Sistema totalmente configurado" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
    Write-Host "   1. Reiniciar servidor: npm run dev" -ForegroundColor White
    Write-Host "   2. Testar modal de termos" -ForegroundColor White
    Write-Host "   3. Verificar configurações" -ForegroundColor White
    
} catch {
    Write-Host ""
    Write-Host "❌ ERRO NA EXECUÇÃO DOS SEEDS" -ForegroundColor Red
    Write-Host "=============================" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 Soluções possíveis:" -ForegroundColor Yellow
    Write-Host "   1. Verificar se o banco está rodando" -ForegroundColor White
    Write-Host "   2. Verificar se DATABASE_URL está correta" -ForegroundColor White
    Write-Host "   3. Executar: npx prisma db push" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "✨ Processo concluído!" -ForegroundColor Green
