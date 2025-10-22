# Script para executar testes do sistema DOM
# Abre o navegador e executa os testes automatizados

Write-Host "EXECUTANDO TESTES DO SISTEMA DOM" -ForegroundColor Green
Write-Host ""

# Verificar se o servidor esta rodando
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5
    Write-Host "Servidor rodando em http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "Servidor nao esta rodando. Iniciando..." -ForegroundColor Yellow
    Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden
    Start-Sleep -Seconds 10
}

Write-Host ""
Write-Host "Abrindo navegador para testes..." -ForegroundColor Blue
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "INSTRUCOES PARA OS TESTES:" -ForegroundColor Yellow
Write-Host "1. Permita o acesso a localizacao quando solicitado"
Write-Host "2. Abra o console do navegador (F12)"
Write-Host "3. Execute o script de teste:"
Write-Host "   - Copie o conteudo de 'testar-sistema-completo.js'"
Write-Host "   - Cole no console do navegador"
Write-Host "   - Pressione Enter"
Write-Host ""

Write-Host "TESTES QUE SERAO EXECUTADOS:" -ForegroundColor Cyan
Write-Host "   Teste 1: Geolocalizacao com validacao de distancia"
Write-Host "   Teste 2: Deteccao de WiFi"
Write-Host "   Teste 3: API de Geocoding"
Write-Host "   Teste 4: Sistema de Validacao"
Write-Host ""

Write-Host "RESULTADOS ESPERADOS:" -ForegroundColor Magenta
Write-Host "   Coordenadas devem ser validadas contra ponto de referencia"
Write-Host "   WiFi deve aparecer corretamente"
Write-Host "   Coordenadas incorretas devem ser rejeitadas"
Write-Host "   Modal de aprovacao deve ser ativado para coordenadas distantes"
Write-Host ""

Write-Host "COORDENADAS DE REFERENCIA:" -ForegroundColor Cyan
Write-Host "   Latitude: -23.61404415420112"
Write-Host "   Longitude: -46.633503722316775"
Write-Host "   Distancia maxima: 50 metros"
Write-Host ""

Write-Host "Testes configurados! Execute no navegador." -ForegroundColor Green