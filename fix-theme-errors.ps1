# Script para corrigir automaticamente os erros de tema em todas as páginas
# Este script identifica e corrige todos os erros relacionados ao useTheme

Write-Host "🔍 Identificando arquivos com erros de tema..." -ForegroundColor Cyan

# Lista de arquivos que precisam ser corrigidos
$files = Get-ChildItem -Path "src/pages" -Filter "*.tsx" -Recurse | Where-Object {
    $content = Get-Content $_.FullName -Raw
    # Arquivos que usam useTheme() sem passar perfil
    $content -match "useTheme\(\)" -and
    # E que ainda não têm selectedProfile declarado antes do useTheme
    $content -match "const \{[^}]*\} = useTheme\([^)]*selectedProfile"
}

Write-Host "📋 Arquivos encontrados: $($files.Count)" -ForegroundColor Yellow

foreach ($file in $files) {
    Write-Host "🔧 Corrigindo: $($file.Name)" -ForegroundColor Green

    $content = Get-Content $file.FullName -Raw

    # Padrão 1: useTheme() sem parâmetros
    if ($content -match "useTheme\(\)") {
        $content = $content -replace "useTheme\(\)", "useTheme(selectedProfile?.role.toLowerCase())"
        Write-Host "  ✓ Corrigido useTheme() vazio" -ForegroundColor Green
    }

    # Padrão 2: useTheme com selectedProfile sendo usado antes da declaração
    if ($content -match "const \{[^}]*\} = useTheme\([^)]*selectedProfile") {
        # Encontra onde está o useTheme
        $lines = $content -split "`n"
        $useThemeIndex = -1
        $selectedProfileIndex = -1

        for ($i = 0; $i -lt $lines.Length; $i++) {
            if ($lines[$i] -match "useTheme.*selectedProfile") {
                $useThemeIndex = $i
            }
            if ($lines[$i] -match "const \[selectedProfile") {
                $selectedProfileIndex = $i
                break
            }
        }

        if ($useThemeIndex -ne -1 -and $selectedProfileIndex -ne -1 -and $useThemeIndex -lt $selectedProfileIndex) {
            # Move o useTheme para depois da declaração do selectedProfile
            $useThemeLine = $lines[$useThemeIndex]
            $lines = $lines[0..($useThemeIndex-1)] + $lines[($useThemeIndex+1)..$lines.Length]

            # Insere o useTheme na posição correta
            $lines = $lines[0..$selectedProfileIndex] + $useThemeLine + $lines[($selectedProfileIndex+1)..$lines.Length]

            $content = $lines -join "`n"
            Write-Host "  ✓ Corrigida ordem de declaração" -ForegroundColor Green
        }
    }

    # Padrão 3: Remover updateTheme não utilizado
    if ($content -match "const \{ theme, updateTheme \} = useTheme") {
        $content = $content -replace "const \{ theme, updateTheme \} = useTheme", "const \{ theme \} = useTheme"
        Write-Host "  ✓ Removido updateTheme não utilizado" -ForegroundColor Green
    }

    # Salva o arquivo corrigido
    $content | Set-Content $file.FullName -Encoding UTF8
}

Write-Host "`n✅ Correções concluídas!" -ForegroundColor Green
Write-Host "🔄 Executando verificação final..." -ForegroundColor Cyan

# Executa verificação final
& npm run build 2>&1 | Select-String "error TS" | ForEach-Object {
    Write-Host "❌ Ainda há erros: $_" -ForegroundColor Red
}

Write-Host "`n🎉 Processo concluído!" -ForegroundColor Green
