// Carrega variáveis de ambiente de um único local, de forma consistente com o Next (prioriza .env.local)
// Evita duplicação e divergência entre scripts e app

import fs from 'fs'
import path from 'path'

const CANDIDATE_FILES = [
  '.env.local',
  'env.local',
  '.env',
  'env-example.txt',
  'env-seguro-example.txt',
]

function parseAndSetEnv(filePath: string): void {
  const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
  const lines = content.split(/\r?\n/)
  for (const rawLine of lines) {
    const line = rawLine.trim()
    if (!line || line.startsWith('#')) continue
    const match = line.match(/^([A-Z0-9_]+)\s*=\s*("([^"]*)"|'([^']*)'|([^#]*))\s*$/i)
    if (!match) continue

    const key = match[1]
    const value = match[3] ?? match[4] ?? match[5]?.trim()
    if (typeof value !== 'string') continue

    // Não sobrescreve variáveis já definidas no ambiente
    if (process.env[key] === undefined) {
      process.env[key] = value
    }
  }
}

function loadEnvOnce(): void {
  try {
    const cwd = process.cwd()
    for (const candidate of CANDIDATE_FILES) {
      const abs = path.resolve(cwd, candidate)
      if (fs.existsSync(abs)) {
        parseAndSetEnv(abs)
        break
      }
    }
  } catch (_err) {
    // Silencioso: scripts devem continuar mesmo sem arquivo
  }
}

// Executa imediatamente ao importar
loadEnvOnce()

export {} // módulo apenas com efeitos colaterais


