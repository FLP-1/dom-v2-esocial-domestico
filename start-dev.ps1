# Script para iniciar o servidor de desenvolvimento com todas as variáveis corretas

Write-Host "🔧 Preparando ambiente de desenvolvimento..." -ForegroundColor Cyan

# 1. Garantir que .env.local existe
if (-not (Test-Path .env.local)) {
    Write-Host "📝 Criando .env.local..." -ForegroundColor Yellow
    Copy-Item env.local .env.local -Force
}

# 2. Configurar variáveis de ambiente para o processo
$env:DATABASE_URL = "postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"
$env:NODE_ENV = "development"

Write-Host "✅ DATABASE_URL configurada" -ForegroundColor Green
Write-Host "✅ NODE_ENV configurada" -ForegroundColor Green

# 3. Verificar conexão com banco
Write-Host "`n🔍 Testando conexão com banco de dados..." -ForegroundColor Cyan
$env:PGPASSWORD = "FLP*2025"
$testResult = psql -h localhost -p 5433 -U userdom -d dom -c "SELECT 1;" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Banco de dados acessível" -ForegroundColor Green
} else {
    Write-Host "❌ Erro ao conectar ao banco! Verifique se o PostgreSQL está rodando." -ForegroundColor Red
    exit 1
}

# 4. Regenerar Prisma Client
Write-Host "`n🔄 Regenerando Prisma Client..." -ForegroundColor Cyan
npx prisma generate
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao gerar Prisma Client" -ForegroundColor Red
    exit 1
}

# 5. Iniciar servidor Next.js
Write-Host "`n🚀 Iniciando servidor Next.js..." -ForegroundColor Cyan
Write-Host "📍 Acesse: http://localhost:3000" -ForegroundColor Yellow
Write-Host "📍 CPF teste: 59876913700" -ForegroundColor Yellow
Write-Host "📍 Senha teste: 123456" -ForegroundColor Yellow
Write-Host "`nPressione Ctrl+C para parar o servidor`n" -ForegroundColor Gray

npm run dev

