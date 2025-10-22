# Script para corrigir imports do Prisma em todos os arquivos

$files = @(
    "src\services\configService.ts",
    "src\pages\api\documents\index.ts",
    "src\lib\auth.ts",
    "src\pages\api\users\index.ts",
    "src\pages\api\user-types\index.ts",
    "src\pages\api\timeclock\index.ts",
    "src\pages\api\templates\index.ts",
    "src\pages\api\tasks\index.ts",
    "src\pages\api\terms\index.ts",
    "src\pages\api\tax-guides\index.ts",
    "src\pages\api\system-config\index.ts",
    "src\pages\api\shopping\lists.ts",
    "src\pages\api\statistics\index.ts",
    "src\pages\api\subscriptions\plans.ts",
    "src\pages\api\profiles\index.ts",
    "src\pages\api\payroll\index.ts",
    "src\pages\api\page-data\index.ts",
    "src\pages\api\monitoring\metrics.ts",
    "src\pages\api\monitoring\activity.ts",
    "src\pages\api\notifications\index.ts",
    "src\pages\api\messages\index.ts",
    "src\pages\api\loans\index.ts",
    "src\pages\api\groups\index.ts",
    "src\pages\api\family-members\index.ts",
    "src\pages\api\employers\index.ts",
    "src\pages\api\alerts\index.ts"
)

$count = 0
foreach ($file in $files) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        
        # Substituir import do PrismaClient direto pelo singleton
        $oldPattern1 = "import { PrismaClient } from '@prisma/client'`r`n`r`nconst prisma = new PrismaClient()"
        $oldPattern2 = "import { PrismaClient } from '@prisma/client'`nconst prisma = new PrismaClient()"
        $newImport = "import prisma from '@/lib/prisma'"
        
        if ($content -match "const prisma = new PrismaClient\(\)") {
            $content = $content -replace [regex]::Escape($oldPattern1), $newImport
            $content = $content -replace [regex]::Escape($oldPattern2), $newImport
            $content = $content -replace "import \{ PrismaClient \} from '@prisma/client'[\r\n]+const prisma = new PrismaClient\(\)", $newImport
            
            Set-Content $file $content -NoNewline
            Write-Host "✅ Corrigido: $file" -ForegroundColor Green
            $count++
        }
    }
}

Write-Host "`n📊 Total de arquivos corrigidos: $count" -ForegroundColor Cyan

