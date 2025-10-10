-- CreateTable
CREATE TABLE "solicitacoes_hora_extra" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "data" DATE NOT NULL,
    "inicio" VARCHAR(5) NOT NULL,
    "fim" VARCHAR(5) NOT NULL,
    "justificativa" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'PENDENTE',
    "revisadaPor" VARCHAR(255),
    "revisadaEm" TIMESTAMP(3),
    "observacao" VARCHAR(500),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_hora_extra_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "solicitacoes_hora_extra_usuarioId_idx" ON "solicitacoes_hora_extra"("usuarioId");

-- CreateIndex
CREATE INDEX "solicitacoes_hora_extra_data_idx" ON "solicitacoes_hora_extra"("data");

-- CreateIndex
CREATE INDEX "solicitacoes_hora_extra_status_idx" ON "solicitacoes_hora_extra"("status");

-- AddForeignKey
ALTER TABLE "solicitacoes_hora_extra" ADD CONSTRAINT "solicitacoes_hora_extra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;
