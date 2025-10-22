# Script para abrir página de teste de geolocalização
Write-Host "🧭 Abrindo página de teste de geolocalização..." -ForegroundColor Green

# Verificar se o servidor está rodando
$port = 3001
$url = "http://localhost:$port"

try {
    $response = Invoke-WebRequest -Uri $url -TimeoutSec 5 -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Servidor encontrado na porta $port" -ForegroundColor Green
        
        # Abrir página de teste
        $testUrl = "$url/teste-geolocalizacao-standalone.html"
        Write-Host "🌐 Abrindo: $testUrl" -ForegroundColor Cyan
        Start-Process $testUrl
        
        Write-Host "📝 Instruções:" -ForegroundColor Yellow
        Write-Host "1. Permita o acesso à geolocalização quando solicitado" -ForegroundColor White
        Write-Host "2. Clique em 'Capturar Localização'" -ForegroundColor White
        Write-Host "3. Verifique as coordenadas e endereço capturados" -ForegroundColor White
        Write-Host "4. Observe o log de testes" -ForegroundColor White
        
    } else {
        Write-Host "❌ Servidor não está respondendo na porta $port" -ForegroundColor Red
        Write-Host "💡 Execute 'npm run dev' primeiro" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Servidor não está rodando na porta $port" -ForegroundColor Red
    Write-Host "💡 Execute 'npm run dev' primeiro" -ForegroundColor Yellow
    Write-Host "🔧 Ou execute: npm run dev" -ForegroundColor Cyan
}