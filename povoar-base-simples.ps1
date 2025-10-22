# Script para povoar base de dados com dados específicos
Write-Host "Povoado base de dados..." -ForegroundColor Cyan

# 1. Criar usuário
Write-Host "Criando usuário..." -ForegroundColor Yellow
$usuario = @{
    id = "59876913700"
    nome = "Usuario Teste"
    email = "teste@exemplo.com"
    telefone = "11999999999"
    ativo = $true
    dataCriacao = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# 2. Criar grupo
Write-Host "Criando grupo..." -ForegroundColor Yellow
$grupo = @{
    id = "grupo-teste-001"
    nome = "Grupo Teste"
    descricao = "Grupo para testes de geofencing"
    ativo = $true
    dataCriacao = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# 3. Criar local de trabalho
Write-Host "Criando local de trabalho..." -ForegroundColor Yellow
$localTrabalho = @{
    id = "local-teste-001"
    nome = "Local Principal"
    endereco = "R. Dias de Toledo, 402"
    latitude = -23.614044208984254
    longitude = -46.63352514948363
    raio = 50
    ativo = $true
    empregadorId = "59876913700"
    grupoId = "grupo-teste-001"
    dataCriacao = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

# 4. Criar relação usuário-grupo
Write-Host "Criando relação usuário-grupo..." -ForegroundColor Yellow
$usuarioGrupo = @{
    id = "ug-teste-001"
    usuarioId = "59876913700"
    grupoId = "grupo-teste-001"
    ativo = $true
    dataCriacao = (Get-Date).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
}

Write-Host "Dados preparados para inserção!" -ForegroundColor Green
Write-Host "Usuario: $($usuario.id)" -ForegroundColor White
Write-Host "Grupo: $($grupo.nome)" -ForegroundColor White
Write-Host "Local: $($localTrabalho.nome) - $($localTrabalho.endereco)" -ForegroundColor White
Write-Host "Coordenadas: $($localTrabalho.latitude), $($localTrabalho.longitude)" -ForegroundColor White
Write-Host "Raio: $($localTrabalho.raio)m" -ForegroundColor White
