# Script para verificar e ativar Windows Location Service
# Necessario para geolocalizacao precisa no desktop

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  VERIFICACAO: Windows Location Service" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se esta rodando como Administrador
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "AVISO: Nao esta rodando como Administrador" -ForegroundColor Yellow
    Write-Host "Algumas verificacoes podem estar limitadas" -ForegroundColor Yellow
    Write-Host ""
}

# 1. Verificar se o servico de localizacao esta ativo
Write-Host "1. Verificando servico de localizacao..." -ForegroundColor Cyan

try {
    $locationService = Get-Service -Name "lfsvc" -ErrorAction SilentlyContinue
    
    if ($null -eq $locationService) {
        Write-Host "   [X] Servico de localizacao NAO encontrado" -ForegroundColor Red
        Write-Host "      (Isso e normal em algumas versoes do Windows)" -ForegroundColor Gray
    }
    elseif ($locationService.Status -eq "Running") {
        Write-Host "   [OK] Servico de localizacao ATIVO" -ForegroundColor Green
    }
    else {
        Write-Host "   [!] Servico de localizacao INATIVO" -ForegroundColor Yellow
        Write-Host "      Status: $($locationService.Status)" -ForegroundColor Gray
        
        if ($isAdmin) {
            $resposta = Read-Host "   Deseja tentar ativar? (S/N)"
            if ($resposta -eq "S" -or $resposta -eq "s") {
                try {
                    Start-Service -Name "lfsvc"
                    Write-Host "   [OK] Servico iniciado com sucesso!" -ForegroundColor Green
                }
                catch {
                    Write-Host "   [X] Erro ao iniciar servico: $_" -ForegroundColor Red
                }
            }
        }
        else {
            Write-Host "      Execute como Administrador para ativar" -ForegroundColor Yellow
        }
    }
}
catch {
    Write-Host "   [X] Erro ao verificar servico: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Verificar configuracoes de privacidade de localizacao
Write-Host "2. Verificando configuracoes de privacidade..." -ForegroundColor Cyan

try {
    $locationConsent = Get-ItemProperty -Path "HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\location" -Name "Value" -ErrorAction SilentlyContinue
    
    if ($null -eq $locationConsent) {
        Write-Host "   [!] Nao foi possivel verificar configuracoes de privacidade" -ForegroundColor Yellow
    }
    elseif ($locationConsent.Value -eq "Allow") {
        Write-Host "   [OK] Localizacao PERMITIDA para aplicativos" -ForegroundColor Green
    }
    else {
        Write-Host "   [X] Localizacao BLOQUEADA" -ForegroundColor Red
        Write-Host "      Valor atual: $($locationConsent.Value)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "   [!] Erro ao verificar registro: $_" -ForegroundColor Yellow
}

Write-Host ""

# 3. Instrucoes para ativar manualmente
Write-Host "3. Como ativar manualmente:" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Configuracoes do Windows:" -ForegroundColor White
Write-Host "   1. Pressione Win + I (abre Configuracoes)" -ForegroundColor Gray
Write-Host "   2. Va em 'Privacidade e Seguranca'" -ForegroundColor Gray
Write-Host "   3. Clique em 'Localizacao'" -ForegroundColor Gray
Write-Host "   4. ATIVE 'Servicos de localizacao'" -ForegroundColor Gray
Write-Host "   5. ATIVE 'Permitir que aplicativos acessem sua localizacao'" -ForegroundColor Gray
Write-Host "   6. Role ate 'Google Chrome' e ATIVE" -ForegroundColor Gray
Write-Host ""

# 4. Verificar adaptadores de rede WiFi
Write-Host "4. Verificando adaptadores WiFi..." -ForegroundColor Cyan

try {
    $wifiAdapters = Get-NetAdapter | Where-Object { $_.InterfaceDescription -like "*Wi-Fi*" -or $_.InterfaceDescription -like "*Wireless*" }
    
    if ($wifiAdapters.Count -gt 0) {
        Write-Host "   [OK] Encontrado(s) $($wifiAdapters.Count) adaptador(es) WiFi:" -ForegroundColor Green
        foreach ($adapter in $wifiAdapters) {
            $status = if ($adapter.Status -eq "Up") { "[OK]" } else { "[X]" }
            Write-Host "      $status $($adapter.Name) - Status: $($adapter.Status)" -ForegroundColor Gray
        }
    }
    else {
        Write-Host "   [!] Nenhum adaptador WiFi encontrado" -ForegroundColor Yellow
        Write-Host "      (Geolocalizacao por WiFi nao disponivel)" -ForegroundColor Gray
    }
}
catch {
    Write-Host "   [X] Erro ao verificar adaptadores: $_" -ForegroundColor Red
}

Write-Host ""

# 5. Resumo e proximos passos
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host "  RESUMO" -ForegroundColor Cyan
Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Status Geral:" -ForegroundColor White
Write-Host ""

$hasWifi = (Get-NetAdapter | Where-Object { $_.InterfaceDescription -like "*Wi-Fi*" -and $_.Status -eq "Up" }).Count -gt 0
$serviceOk = $locationService -and $locationService.Status -eq "Running"

if ($hasWifi -and $serviceOk) {
    Write-Host "   [OK] Sistema preparado para geolocalizacao por WiFi" -ForegroundColor Green
    Write-Host "   Precisao esperada: 50-200 metros" -ForegroundColor Green
}
elseif ($hasWifi) {
    Write-Host "   [!] WiFi OK, mas servico de localizacao pode estar inativo" -ForegroundColor Yellow
    Write-Host "   Precisao: pode ser limitada" -ForegroundColor Yellow
}
else {
    Write-Host "   [X] Sem WiFi ativo - precisao limitada" -ForegroundColor Red
    Write-Host "   Precisao: 500m-5km (localizacao por IP)" -ForegroundColor Red
}

Write-Host ""
Write-Host "Proximo passo:" -ForegroundColor White
Write-Host "   1. Ative as configuracoes manualmente (veja instrucoes acima)" -ForegroundColor Gray
Write-Host "   2. Acesse: http://localhost:3000/test-geo-forcado" -ForegroundColor Gray
Write-Host "   3. Configure permissao no Chrome (cadeado ao lado da URL)" -ForegroundColor Gray
Write-Host "   4. Teste a geolocalizacao" -ForegroundColor Gray
Write-Host ""

Write-Host "==================================================" -ForegroundColor Cyan
Write-Host ""

# Pausar no final
Read-Host "Pressione ENTER para sair"
