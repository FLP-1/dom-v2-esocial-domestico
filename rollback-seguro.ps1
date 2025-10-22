# Script de Rollback Seguro para Experimentos DOM
# Criado para facilitar o retorno ao estado anterior

param(
    [switch]$Help,
    [switch]$Status,
    [switch]$Rollback,
    [switch]$Stable
)

function Show-Help {
    Write-Host "=== SCRIPT DE ROLLBACK SEGURO DOM ===" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Uso:" -ForegroundColor Yellow
    Write-Host "  .\rollback-seguro.ps1 -Status     # Ver status atual"
    Write-Host "  .\rollback-seguro.ps1 -Stable     # Ir para versão estável"
    Write-Host "  .\rollback-seguro.ps1 -Rollback   # Voltar ao backup seguro"
    Write-Host "  .\rollback-seguro.ps1 -Help       # Mostrar esta ajuda"
    Write-Host ""
    Write-Host "PONTOS DE RESTAURAÇÃO:" -ForegroundColor Green
    Write-Host "  🏠 stable-working-version" -ForegroundColor Green
    Write-Host "     💚 VERSÃO ESTÁVEL: Versão funcionando perfeitamente"
    Write-Host ""
    Write-Host "  ✅ experimentos-layout-atual (commit: 1689031)" -ForegroundColor Yellow
    Write-Host "     💾 BACKUP: Estado atual antes dos experimentos"
    Write-Host ""
    Write-Host "  🔬 experimentos-layout-funcionalidades (atual)" -ForegroundColor Cyan
    Write-Host "     🧪 Branch para testes e experimentos"
    Write-Host ""
}

function Show-Status {
    Write-Host "=== STATUS ATUAL ===" -ForegroundColor Cyan
    Write-Host ""
    
    # Verificar branch atual
    $currentBranch = git branch --show-current
    Write-Host "Branch atual: " -NoNewline -ForegroundColor Yellow
    Write-Host $currentBranch -ForegroundColor White
    
    # Verificar status do git
    Write-Host ""
    Write-Host "Status do Git:" -ForegroundColor Yellow
    git status --short
    
    # Verificar últimos commits
    Write-Host ""
    Write-Host "Últimos 3 commits:" -ForegroundColor Yellow
    git log --oneline -3
    
    Write-Host ""
    Write-Host "Para voltar ao backup seguro:" -ForegroundColor Green
    Write-Host "  .\rollback-seguro.ps1 -Rollback" -ForegroundColor White
}

function Invoke-Stable {
    Write-Host "=== INDO PARA VERSÃO ESTÁVEL ===" -ForegroundColor Green
    Write-Host ""
    
    # Confirmar ação
    $confirmation = Read-Host "💚 Ir para a versão estável funcionando? (s/N)"
    
    if ($confirmation -ne 's' -and $confirmation -ne 'S') {
        Write-Host "❌ Ação cancelada pelo usuário." -ForegroundColor Yellow
        return
    }
    
    Write-Host "🏠 Mudando para versão estável..." -ForegroundColor Green
    git checkout stable-working-version
    
    Write-Host "🧹 Limpando mudanças não commitadas..." -ForegroundColor Yellow
    git reset --hard HEAD
    
    Write-Host "✅ Agora você está na versão estável!" -ForegroundColor Green
    Write-Host ""
    Write-Host "💚 Esta é sua versão funcionando perfeitamente" -ForegroundColor Green
    Write-Host ""
    Write-Host "Para voltar aos experimentos:" -ForegroundColor Yellow
    Write-Host "  git checkout experimentos-layout-funcionalidades" -ForegroundColor White
}

function Invoke-Rollback {
    Write-Host "=== EXECUTANDO ROLLBACK SEGURO ===" -ForegroundColor Red
    Write-Host ""
    
    # Confirmar ação
    $confirmation = Read-Host "⚠️  ATENÇÃO: Isso irá descartar todas as mudanças não commitadas. Continuar? (s/N)"
    
    if ($confirmation -ne 's' -and $confirmation -ne 'S') {
        Write-Host "❌ Rollback cancelado pelo usuário." -ForegroundColor Yellow
        return
    }
    
    Write-Host "🔄 Voltando para o branch de backup..." -ForegroundColor Yellow
    git checkout experimentos-layout-atual
    
    Write-Host "🧹 Limpando mudanças não commitadas..." -ForegroundColor Yellow
    git reset --hard HEAD
    
    Write-Host "✅ Rollback concluído!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Você está de volta ao estado seguro do commit 1689031" -ForegroundColor Green
    Write-Host "Todas as suas mudanças anteriores estão preservadas." -ForegroundColor Green
    Write-Host ""
    Write-Host "Para voltar aos experimentos:" -ForegroundColor Yellow
    Write-Host "  git checkout experimentos-layout-funcionalidades" -ForegroundColor White
}

# Executar função baseada no parâmetro
if ($Help) {
    Show-Help
}
elseif ($Status) {
    Show-Status
}
elseif ($Stable) {
    Invoke-Stable
}
elseif ($Rollback) {
    Invoke-Rollback
}
else {
    Show-Help
}
