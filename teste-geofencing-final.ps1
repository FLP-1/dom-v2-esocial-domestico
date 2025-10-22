# Script para testar sistema de geofencing completo
Write-Host "🎯 Testando Sistema de Geofencing Completo" -ForegroundColor Cyan

# 1. Testar listagem de locais
Write-Host "`n📍 Testando listagem de locais..." -ForegroundColor Yellow
try {
    $locais = Invoke-RestMethod -Uri "http://localhost:3000/api/geofencing/locais" -Method GET
    Write-Host "✅ Locais encontrados: $($locais.locais.Count)" -ForegroundColor Green
    foreach ($local in $locais.locais) {
        Write-Host "  - $($local.nome): $($local.endereco)" -ForegroundColor White
        Write-Host "    Coordenadas: $($local.latitude), $($local.longitude)" -ForegroundColor Gray
        Write-Host "    Raio: $($local.raio)m" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erro ao listar locais: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Testar validação DENTRO do raio (coordenadas exatas)
Write-Host "`n🎯 Testando validação DENTRO do raio..." -ForegroundColor Yellow
$dadosDentro = @{
    latitude = -23.614044208984254
    longitude = -46.63352514948363
    precisao = 10
    endereco = "R. Dias de Toledo, 402"
    wifiName = "TestWiFi"
} | ConvertTo-Json

try {
    $resultadoDentro = Invoke-RestMethod -Uri "http://localhost:3000/api/geofencing/validar" -Method POST -Body $dadosDentro -ContentType "application/json"
    Write-Host "✅ Validação dentro do raio:" -ForegroundColor Green
    Write-Host "  - Dentro do geofence: $($resultadoDentro.dentroGeofence)" -ForegroundColor White
    Write-Host "  - Distância mínima: $($resultadoDentro.distanciaMinima)m" -ForegroundColor White
    if ($resultadoDentro.localMaisProximo) {
        Write-Host "  - Local mais próximo: $($resultadoDentro.localMaisProximo.nome)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro na validação dentro do raio: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Testar validação FORA do raio (coordenadas distantes)
Write-Host "`n🚫 Testando validação FORA do raio..." -ForegroundColor Yellow
$dadosFora = @{
    latitude = -23.620000000000000  # Coordenadas distantes
    longitude = -46.640000000000000
    precisao = 10
    endereco = "Local Distante"
    wifiName = "TestWiFi"
} | ConvertTo-Json

try {
    $resultadoFora = Invoke-RestMethod -Uri "http://localhost:3000/api/geofencing/validar" -Method POST -Body $dadosFora -ContentType "application/json"
    Write-Host "✅ Validação fora do raio:" -ForegroundColor Green
    Write-Host "  - Dentro do geofence: $($resultadoFora.dentroGeofence)" -ForegroundColor White
    Write-Host "  - Distância mínima: $($resultadoFora.distanciaMinima)m" -ForegroundColor White
    if ($resultadoFora.localMaisProximo) {
        Write-Host "  - Local mais próximo: $($resultadoFora.localMaisProximo.nome)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erro na validação fora do raio: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Teste concluído!" -ForegroundColor Cyan
