# PowerShell script para criar a estrutura de diretório e arquivos

$base = "E:\DOM"

# Cria diretórios
$dirs = @(
  "$base\public",
  "$base\src\components\Button",
  "$base\src\components\Card",
  "$base\src\components\Tooltip",
  "$base\src\contexts",
  "$base\src\hooks",
  "$base\src\layouts",
  "$base\src\pages",
  "$base\src\styles",
  "$base\src\utils"
)
foreach ($d in $dirs) {
  if (!(Test-Path $d)) { New-Item -ItemType Directory -Path $d }
}

# Cria arquivos com conteúdo inicial
$files = @{
  "$base\.gitignore" = "node_modules/`n.next/`n.env"
  "$base\package.json" = '{ "name": "dom-frontend", "version": "0.1.0", "private": true, "scripts": { "dev": "next dev", "build": "next build", "start": "next start" } }'
  "$base\tsconfig.json" = '{ "compilerOptions": { "target": "es5", "lib": ["dom","dom.iterable","esnext"], "allowJs": true, "skipLibCheck": true, "strict": true, "forceConsistentCasingInFileNames": true, "noEmit": true, "esModuleInterop": true, "module": "esnext", "moduleResolution": "node", "resolveJsonModule": true, "isolatedModules": true, "jsx": "preserve" }, "include": ["next-env.d.ts","**/*.ts","**/*.tsx"] }'
  "$base\next.config.js" = "module.exports = { reactStrictMode: true }"
  "$base\README.md" = "# DOM Frontend`n`nEstrutura do projeto frontend para Next.js"
  "$base\next-env.d.ts" = "/// <reference types=""next"" />`n/// <reference types=""next/types/global"" />"
  "$base\public\favicon.ico" = ""
  "$base\public\logo.png" = ""
}

foreach ($path in $files.Keys) {
  $content = $files[$path]
  if (!(Test-Path (Split-Path $path))) {
    New-Item -ItemType Directory -Path (Split-Path $path) -Force
  }
  Set-Content -Path $path -Value $content -Encoding UTF8
}

Write-Host "Estrutura DOM criada em E:\DOM"
