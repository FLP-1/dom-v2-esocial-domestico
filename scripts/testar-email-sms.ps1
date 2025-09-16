# Script para testar configuração de email e SMS
Write-Host "🧪 TESTANDO CONFIGURAÇÃO DE EMAIL E SMS" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Verificar se o arquivo .env.local existe
if (Test-Path ".env.local") {
    Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
} else {
    Write-Host "❌ Arquivo .env.local não encontrado" -ForegroundColor Red
    Write-Host "📝 Crie o arquivo .env.local com as configurações necessárias" -ForegroundColor Yellow
    Write-Host "📖 Consulte a documentação em docs/CONFIGURACAO_EMAIL_SMS.md" -ForegroundColor Yellow
    exit 1
}

# Verificar variáveis de email
Write-Host "`n📧 Verificando configuração de email..." -ForegroundColor Yellow
$emailUser = Get-Content .env.local | Select-String "EMAIL_USER" | ForEach-Object { $_.Line.Split("=")[1] }
$emailPass = Get-Content .env.local | Select-String "EMAIL_PASS" | ForEach-String { $_.Line.Split("=")[1] }

if ($emailUser -and $emailPass) {
    Write-Host "✅ Credenciais de email configuradas" -ForegroundColor Green
} else {
    Write-Host "⚠️ Credenciais de email não configuradas (modo simulação)" -ForegroundColor Yellow
}

# Verificar variáveis de SMS
Write-Host "`n📱 Verificando configuração de SMS..." -ForegroundColor Yellow
$twilioSid = Get-Content .env.local | Select-String "TWILIO_ACCOUNT_SID" | ForEach-Object { $_.Line.Split("=")[1] }
$twilioToken = Get-Content .env.local | Select-String "TWILIO_AUTH_TOKEN" | ForEach-Object { $_.Line.Split("=")[1] }
$twilioPhone = Get-Content .env.local | Select-String "TWILIO_PHONE_NUMBER" | ForEach-Object { $_.Line.Split("=")[1] }

if ($twilioSid -and $twilioToken -and $twilioPhone) {
    Write-Host "✅ Credenciais de SMS configuradas" -ForegroundColor Green
} else {
    Write-Host "⚠️ Credenciais de SMS não configuradas (modo simulação)" -ForegroundColor Yellow
}

# Testar APIs
Write-Host "`n🧪 Testando APIs..." -ForegroundColor Yellow

# Testar API de email
Write-Host "📧 Testando API de email..." -ForegroundColor Blue
try {
    $emailResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/enviar-email" -Method POST -ContentType "application/json" -Body '{"email":"teste@exemplo.com","codigo":"TEST123"}'
    Write-Host "✅ API de email funcionando: $($emailResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na API de email: $($_.Exception.Message)" -ForegroundColor Red
}

# Testar API de SMS
Write-Host "`n📱 Testando API de SMS..." -ForegroundColor Blue
try {
    $smsResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/enviar-sms" -Method POST -ContentType "application/json" -Body '{"telefone":"+5511999999999","codigo":"TEST456"}'
    Write-Host "✅ API de SMS funcionando: $($smsResponse.message)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erro na API de SMS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 Teste concluído!" -ForegroundColor Cyan
Write-Host "📖 Para configurar envio real, consulte: docs/CONFIGURACAO_EMAIL_SMS.md" -ForegroundColor Yellow
