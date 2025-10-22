# 🧪 Script para testar geolocalização melhorada
# Executa o servidor de desenvolvimento e abre o teste

Write-Host "🧪 TESTE DE GEOLOCALIZAÇÃO MELHORADA" -ForegroundColor Green
Write-Host ""

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: Execute este script no diretório raiz do projeto DOM" -ForegroundColor Red
    exit 1
}

Write-Host "📋 MELHORIAS IMPLEMENTADAS:" -ForegroundColor Yellow
Write-Host "   ✅ Precisão aumentada para 20 metros (era 50m)"
Write-Host "   ✅ Mais tentativas de captura (5 tentativas, era 3)"
Write-Host "   ✅ Timeout aumentado para 15 segundos (era 10s)"
Write-Host "   ✅ Validação de distância do ponto de referência"
Write-Host "   ✅ Atualização mais frequente (2 minutos, era 5 minutos)"
Write-Host ""

Write-Host "🚀 Iniciando servidor de desenvolvimento..." -ForegroundColor Blue
Start-Process -FilePath "npm" -ArgumentList "run", "dev" -WindowStyle Hidden

# Aguardar o servidor iniciar
Write-Host "⏳ Aguardando servidor iniciar..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🌐 Abrindo teste no navegador..." -ForegroundColor Blue
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "📝 INSTRUÇÕES PARA O TESTE:" -ForegroundColor Yellow
Write-Host "1. Permita o acesso à localização quando solicitado"
Write-Host "2. Abra o console do navegador (F12)"
Write-Host "3. Execute o script de teste:"
Write-Host "   - Copie o conteúdo de 'testar-geolocalizacao-melhorada.js'"
Write-Host "   - Cole no console do navegador"
Write-Host "   - Pressione Enter"
Write-Host ""
Write-Host "4. Verifique os resultados:"
Write-Host "   - Precisão deve ser ≤ 20 metros"
Write-Host "   - Distância do ponto de referência deve ser ≤ 100 metros"
Write-Host "   - Endereço deve mostrar 'R. Dias de Toledo, 402'"
Write-Host ""

Write-Host "🎯 COORDENADAS DE REFERÊNCIA:" -ForegroundColor Cyan
Write-Host "   Latitude: -23.61404415420112"
Write-Host "   Longitude: -46.633503722316775"
Write-Host "   Endereço: R. Dias de Toledo, 402"
Write-Host ""

Write-Host "✅ Teste configurado! Verifique o navegador." -ForegroundColor Green
