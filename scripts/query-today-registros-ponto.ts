import './shared/load-env'
import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    const now = new Date()
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)

    // Consulta direta, respeitando o mapeamento @@map("registros_ponto")
    const rows = await prisma.$queryRawUnsafe<any[]>(
      `SELECT id, "usuarioId", "dispositivoId", "dataHora", tipo, latitude, longitude, precisao, "nomeRedeWiFi", "enderecoIP"
       FROM "registros_ponto"
       WHERE "dataHora" >= $1 AND "dataHora" < $2
       ORDER BY "dataHora" DESC`,
      start,
      end
    )

    const result = {
      count: rows.length,
      rows,
      window: { start: start.toISOString(), end: end.toISOString() }
    }

    // Saída JSON limpa para consumo em CI/terminal
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(result, null, 2))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('[query-today-registros-ponto] Erro:', error)
    process.exit(1)
  }
}

main()

