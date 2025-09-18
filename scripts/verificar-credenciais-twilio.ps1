# Script para verificar credenciais do Twilio
Write-Host "🔑 VERIFICANDO CREDENCIAIS DO TWILIO" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Função para verificar se arquivo .env.local existe
function Test-EnvFile {
    if (Test-Path ".env.local") {
        Write-Host "✅ Arquivo .env.local encontrado" -ForegroundColor Green
        return $true
    } else {
        Write-Host "❌ Arquivo .env.local não encontrado" -ForegroundColor Red
        Write-Host "📝 Crie o arquivo .env.local na raiz do projeto" -ForegroundColor Yellow
        return $false
    }
}

# Função para extrair valor do .env.local
function Get-EnvValue {
    param([string]$Key)

    if (Test-Path ".env.local") {
        $line = Get-Content .env.local | Where-Object { $_ -match "^$Key=" }
        if ($line) {
            return $line.Split("=", 2)[1].Trim()
        }
    }
    return $null
}

# Verificar arquivo .env.local
if (-not (Test-EnvFile)) {
    Write-Host "`n📖 Consulte: docs/CREDENCIAIS_TWILIO.md" -ForegroundColor Yellow
    exit 1
}

Write-Host "`n📱 VERIFICANDO CREDENCIAIS DE SMS..." -ForegroundColor Yellow

# Verificar credenciais de SMS
$accountSid = Get-EnvValue "TWILIO_ACCOUNT_SID"
$authToken = Get-EnvValue "TWILIO_AUTH_TOKEN"
$phoneNumber = Get-EnvValue "TWILIO_PHONE_NUMBER"

if ($accountSid) {
    if ($accountSid -match "^AC[a-f0-9]{32}$") {
        Write-Host "✅ TWILIO_ACCOUNT_SID: Formato correto" -ForegroundColor Green
    } else {
        Write-Host "❌ TWILIO_ACCOUNT_SID: Formato incorreto" -ForegroundColor Red
        Write-Host "   Deve começar com 'AC' e ter 34 caracteres" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ TWILIO_ACCOUNT_SID: Não configurado" -ForegroundColor Red
}

if ($authToken) {
    if ($authToken.Length -eq 32) {
        Write-Host "✅ TWILIO_AUTH_TOKEN: Formato correto" -ForegroundColor Green
    } else {
        Write-Host "❌ TWILIO_AUTH_TOKEN: Formato incorreto" -ForegroundColor Red
        Write-Host "   Deve ter 32 caracteres" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ TWILIO_AUTH_TOKEN: Não configurado" -ForegroundColor Red
}

if ($phoneNumber) {
    if ($phoneNumber -match "^\+\d{10,15}$") {
        Write-Host "✅ TWILIO_PHONE_NUMBER: Formato correto ($phoneNumber)" -ForegroundColor Green
    } else {
        Write-Host "❌ TWILIO_PHONE_NUMBER: Formato incorreto" -ForegroundColor Red
        Write-Host "   Deve estar no formato +5511999999999" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ TWILIO_PHONE_NUMBER: Não configurado" -ForegroundColor Red
}

Write-Host "`n📧 VERIFICANDO CREDENCIAIS DE EMAIL..." -ForegroundColor Yellow

# Verificar credenciais de email
$sendgridKey = Get-EnvValue "SENDGRID_API_KEY"
$fromEmail = Get-EnvValue "SENDGRID_FROM_EMAIL"

if ($sendgridKey) {
    if ($sendgridKey -match "^SG\.") {
        Write-Host "✅ SENDGRID_API_KEY: Formato correto" -ForegroundColor Green
    } else {
        Write-Host "❌ SENDGRID_API_KEY: Formato incorreto" -ForegroundColor Red
        Write-Host "   Deve começar com 'SG.'" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ SENDGRID_API_KEY: Não configurado" -ForegroundColor Yellow
}

if ($fromEmail) {
    if ($fromEmail -match "^[^@]+@[^@]+\.[^@]+$") {
        Write-Host "✅ SENDGRID_FROM_EMAIL: Formato correto ($fromEmail)" -ForegroundColor Green
    } else {
        Write-Host "❌ SENDGRID_FROM_EMAIL: Formato incorreto" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ SENDGRID_FROM_EMAIL: Não configurado (usará padrão)" -ForegroundColor Yellow
}

# Verificar credenciais alternativas de email
Write-Host "`n📧 VERIFICANDO CREDENCIAIS ALTERNATIVAS DE EMAIL..." -ForegroundColor Yellow

$emailUser = Get-EnvValue "EMAIL_USER"
$emailPass = Get-EnvValue "EMAIL_PASS"

if ($emailUser) {
    if ($emailUser -match "^[^@]+@[^@]+\.[^@]+$") {
        Write-Host "✅ EMAIL_USER: Formato correto ($emailUser)" -ForegroundColor Green
    } else {
        Write-Host "❌ EMAIL_USER: Formato incorreto" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ EMAIL_USER: Não configurado" -ForegroundColor Yellow
}

if ($emailPass) {
    Write-Host "✅ EMAIL_PASS: Configurado" -ForegroundColor Green
} else {
    Write-Host "⚠️ EMAIL_PASS: Não configurado" -ForegroundColor Yellow
}

# Resumo
Write-Host "`n📊 RESUMO:" -ForegroundColor Cyan

$smsConfigured = $accountSid -and $authToken -and $phoneNumber
$sendgridConfigured = $sendgridKey
$nodemailerConfigured = $emailUser -and $emailPass

if ($smsConfigured) {
    Write-Host "✅ SMS (Twilio): Configurado" -ForegroundColor Green
} else {
    Write-Host "❌ SMS (Twilio): Não configurado" -ForegroundColor Red
}

if ($sendgridConfigured) {
    Write-Host "✅ Email (SendGrid): Configurado" -ForegroundColor Green
} elseif ($nodemailerConfigured) {
    Write-Host "✅ Email (Nodemailer): Configurado" -ForegroundColor Green
} else {
    Write-Host "❌ Email: Nenhum provedor configurado" -ForegroundColor Red
}

Write-Host "`n🔗 LINKS ÚTEIS:" -ForegroundColor Yellow
Write-Host "📖 Documentação completa: docs/CREDENCIAIS_TWILIO.md" -ForegroundColor White
Write-Host "🌐 Console Twilio: https://console.twilio.com" -ForegroundColor White
Write-Host "📧 Console SendGrid: https://app.sendgrid.com" -ForegroundColor White
Write-Host "🧪 Testar APIs: http://localhost:3000/api/status-email" -ForegroundColor White

if ($smsConfigured -or $sendgridConfigured -or $nodemailerConfigured) {
    Write-Host "`n🎉 Pelo menos um serviço está configurado!" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ Nenhum serviço está configurado. Sistema usará modo simulação." -ForegroundColor Yellow
}
