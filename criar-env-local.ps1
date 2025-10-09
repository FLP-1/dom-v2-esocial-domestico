# Script para criar o arquivo .env.local com as configurações do banco de dados
# Execute este script para configurar o ambiente local

$conteudo = @"
# 🔐 Configurações do Sistema DOM v2.2.1
# Arquivo de configuração local

# ===========================================
# 🗄️ BANCO DE DADOS
# ===========================================

DATABASE_URL="postgresql://userdom:FLP*2025@localhost:5433/dom?schema=public"

# ===========================================
# 🌐 CONFIGURAÇÕES DE AMBIENTE
# ===========================================

NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# ===========================================
# 🔑 SEGURANÇA
# ===========================================

JWT_SECRET=dom_secret_key_32_chars_min_2025
JWT_EXPIRES_IN=7d

NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dom_nextauth_secret_key_2025

# ===========================================
# 📧 CONFIGURAÇÕES DE EMAIL
# ===========================================

SENDGRID_API_KEY=sua_chave_sendgrid_aqui
SENDGRID_FROM_EMAIL=seu_email@dominio.com

# ===========================================
# 🌐 CONFIGURAÇÕES ESOCIAL
# ===========================================

ESOCIAL_EMPREGADOR_CPF=59876913700
ESOCIAL_EMPREGADOR_NOME=FLP Business Strategy
ESOCIAL_CERTIFICATE_PATH=./certificados/eCPF A1 24940271 (senha 456587).pfx
ESOCIAL_CERTIFICATE_PASSWORD=456587
ESOCIAL_URL_PRODUCAO=https://webservices.envio.esocial.gov.br
ESOCIAL_URL_HOMOLOGACAO=https://webservices.producaorestrita.esocial.gov.br

# ===========================================
# 📱 TWILIO SMS
# ===========================================

TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+12183668060
"@

# Criar o arquivo .env.local
$conteudo | Out-File -FilePath ".env.local" -Encoding utf8 -NoNewline

Write-Host "✅ Arquivo .env.local criado com sucesso!" -ForegroundColor Green
Write-Host "📍 Localização: $PWD\.env.local" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 Configurações do Banco de Dados:" -ForegroundColor Yellow
Write-Host "   - Host: localhost" -ForegroundColor White
Write-Host "   - Porta: 5433" -ForegroundColor White
Write-Host "   - Usuário: userdom" -ForegroundColor White
Write-Host "   - Banco: dom" -ForegroundColor White
Write-Host ""
Write-Host "📝 Próximos passos:" -ForegroundColor Yellow
Write-Host "   1. Execute: npx prisma generate" -ForegroundColor White
Write-Host "   2. Execute: npx prisma db push" -ForegroundColor White
Write-Host "   3. Execute: npm run dev" -ForegroundColor White

