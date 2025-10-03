# ============================================
# 🌱 SCRIPT PARA POPULAR O BANCO DE DADOS
# Sistema DOM v2.2.1
# ============================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     🌱 POPULANDO BANCO DE DADOS - SEED        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Host "📌 Instalando dependências necessárias..." -ForegroundColor Yellow
npm install --save-dev tsx ts-node @types/bcryptjs 2>&1 | Out-Null
Write-Host "   ✅ Dependências instaladas!" -ForegroundColor Green
Write-Host ""

Write-Host "📌 Executando seed do banco de dados..." -ForegroundColor Yellow
Write-Host ""

# Executar o seed
$env:DATABASE_URL = "postgresql://userdom:FLP*2025@localhost:5433/dom_v2?schema=public"
npx tsx prisma/seed.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║        ✅ SEED EXECUTADO COM SUCESSO!         ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    
    # Verificar dados inseridos
    Write-Host "📊 VERIFICANDO DADOS INSERIDOS..." -ForegroundColor Cyan
    Write-Host ""
    
    $usuarios = psql -h localhost -p 5433 -U postgres -d dom_v2 -t -c "SELECT COUNT(*) FROM usuarios;" 2>&1
    $perfis = psql -h localhost -p 5433 -U postgres -d dom_v2 -t -c "SELECT COUNT(*) FROM perfis;" 2>&1
    $documentos = psql -h localhost -p 5433 -U postgres -d dom_v2 -t -c "SELECT COUNT(*) FROM documentos;" 2>&1
    $tarefas = psql -h localhost -p 5433 -U postgres -d dom_v2 -t -c "SELECT COUNT(*) FROM tarefas;" 2>&1
    
    Write-Host "   👤 Usuários: $($usuarios.Trim())" -ForegroundColor White
    Write-Host "   👔 Perfis: $($perfis.Trim())" -ForegroundColor White
    Write-Host "   📄 Documentos: $($documentos.Trim())" -ForegroundColor White
    Write-Host "   ✅ Tarefas: $($tarefas.Trim())" -ForegroundColor White
    Write-Host ""
    
    Write-Host "🔑 CREDENCIAIS DE TESTE:" -ForegroundColor Yellow
    Write-Host "   📧 Email: francisco@flpbusiness.com" -ForegroundColor White
    Write-Host "   🔒 Senha: senha123" -ForegroundColor White
    Write-Host "   👤 CPF: 59876913700" -ForegroundColor White
    Write-Host ""
    Write-Host "   OU" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   📧 Email: maria.santos@email.com" -ForegroundColor White
    Write-Host "   🔒 Senha: senha123" -ForegroundColor White
    Write-Host "   👤 CPF: 38645446880" -ForegroundColor White
    Write-Host ""
    
} else {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║           ❌ ERRO AO EXECUTAR SEED!           ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Erro: Código de saída $LASTEXITCODE" -ForegroundColor Red
    Write-Host ""
}

Write-Host "Pressione qualquer tecla para continuar..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

