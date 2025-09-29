# Script para configurar gov.br automaticamente
Write-Host "=== CONFIGURACAO AUTOMATICA GOV.BR ==="
Write-Host ""

Write-Host "1. Verificando se .env.local existe..."
if (Test-Path ".env.local") {
    Write-Host "   OK - Arquivo .env.local encontrado"
} else {
    Write-Host "   CRIANDO - Arquivo .env.local..."
    Copy-Item "env-local-template.txt" ".env.local"
    Write-Host "   OK - Arquivo .env.local criado"
}
Write-Host ""

Write-Host "2. Verificando configuracoes atuais..."
$envContent = Get-Content ".env.local" -Raw
if ($envContent -match "GOV_BR_CLIENT_ID=SEU_CLIENT_ID_AQUI") {
    Write-Host "   AVISO - Client ID nao configurado"
    Write-Host "   Configure no arquivo .env.local"
} else {
    Write-Host "   OK - Client ID configurado"
}

if ($envContent -match "GOV_BR_CLIENT_SECRET=SEU_CLIENT_SECRET_AQUI") {
    Write-Host "   AVISO - Client Secret nao configurado"
    Write-Host "   Configure no arquivo .env.local"
} else {
    Write-Host "   OK - Client Secret configurado"
}
Write-Host ""

Write-Host "3. Testando API com configuracoes atuais..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/esocial-real-govbr" -Method POST -ContentType "application/json" -Body '{"action":"getAuthUrl","cpfCnpj":"59876913700","environment":"homologacao"}' -UseBasicParsing
    Write-Host "   OK - API funcionando: $($response.StatusCode)"

    $data = $response.Content | ConvertFrom-Json
    if ($data.data.authUrl) {
        Write-Host "   OK - URL de autorizacao gerada"
        if ($data.data.authUrl -match "SEU_CLIENT_ID_AQUI") {
            Write-Host "   AVISO - Usando Client ID padrao (nao configurado)"
        } else {
            Write-Host "   OK - Usando Client ID configurado"
        }
    }
} catch {
    Write-Host "   ERRO - API nao funcionando: $($_.Exception.Message)"
}
Write-Host ""

Write-Host "4. Testando paginas..."
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/test-govbr" -UseBasicParsing
    Write-Host "   OK - Pagina de teste: $($response.StatusCode)"
} catch {
    Write-Host "   ERRO - Pagina de teste: $($_.Exception.Message)"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/test-simple" -UseBasicParsing
    Write-Host "   OK - Pagina simples: $($response.StatusCode)"
} catch {
    Write-Host "   ERRO - Pagina simples: $($_.Exception.Message)"
}
Write-Host ""

Write-Host "=== PROXIMOS PASSOS ==="
Write-Host "1. Acesse: https://sso.acesso.gov.br/developer"
Write-Host "2. Crie nova aplicacao com redirect: http://localhost:3000/api/esocial-real-govbr/callback"
Write-Host "3. Copie Client ID e Secret para .env.local"
Write-Host "4. Reinicie o servidor: npm run dev"
Write-Host "5. Teste: http://localhost:3000/test-govbr"
Write-Host ""
Write-Host "=== PAGINAS DISPONIVEIS ==="
Write-Host "- Simulacao: http://localhost:3000/test-simple"
Write-Host "- Teste gov.br: http://localhost:3000/test-govbr"
Write-Host "- Interface principal: http://localhost:3000/esocial-integration"
