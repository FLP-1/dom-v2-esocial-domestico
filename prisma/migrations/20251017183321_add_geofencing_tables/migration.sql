-- AlterTable
ALTER TABLE "registros_ponto" ADD COLUMN     "numeroEndereco" VARCHAR(20);

-- CreateTable
CREATE TABLE "locais_trabalho" (
    "id" TEXT NOT NULL,
    "nome" VARCHAR(255) NOT NULL,
    "endereco" VARCHAR(500) NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "raio" INTEGER NOT NULL DEFAULT 200,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "grupoId" TEXT NOT NULL,
    "empregadorId" TEXT NOT NULL,
    "criadoPor" TEXT NOT NULL,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoPor" TEXT,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "locais_trabalho_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofencing_logs" (
    "id" TEXT NOT NULL,
    "localTrabalhoId" TEXT NOT NULL,
    "acao" VARCHAR(50) NOT NULL,
    "dadosAnteriores" JSONB,
    "dadosNovos" JSONB,
    "ip" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500) NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geofencing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geofencing_validacoes" (
    "id" TEXT NOT NULL,
    "localTrabalhoId" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "distancia" DOUBLE PRECISION NOT NULL,
    "dentroGeofence" BOOLEAN NOT NULL,
    "precisao" DOUBLE PRECISION NOT NULL,
    "endereco" VARCHAR(500),
    "wifiName" VARCHAR(255),
    "ip" VARCHAR(45) NOT NULL,
    "userAgent" VARCHAR(500) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geofencing_validacoes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "locais_trabalho_grupoId_idx" ON "locais_trabalho"("grupoId");

-- CreateIndex
CREATE INDEX "locais_trabalho_empregadorId_idx" ON "locais_trabalho"("empregadorId");

-- CreateIndex
CREATE INDEX "locais_trabalho_ativo_idx" ON "locais_trabalho"("ativo");

-- CreateIndex
CREATE INDEX "geofencing_logs_localTrabalhoId_idx" ON "geofencing_logs"("localTrabalhoId");

-- CreateIndex
CREATE INDEX "geofencing_logs_usuarioId_idx" ON "geofencing_logs"("usuarioId");

-- CreateIndex
CREATE INDEX "geofencing_logs_timestamp_idx" ON "geofencing_logs"("timestamp");

-- CreateIndex
CREATE INDEX "geofencing_validacoes_localTrabalhoId_idx" ON "geofencing_validacoes"("localTrabalhoId");

-- CreateIndex
CREATE INDEX "geofencing_validacoes_usuarioId_idx" ON "geofencing_validacoes"("usuarioId");

-- CreateIndex
CREATE INDEX "geofencing_validacoes_timestamp_idx" ON "geofencing_validacoes"("timestamp");

-- AddForeignKey
ALTER TABLE "locais_trabalho" ADD CONSTRAINT "locais_trabalho_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locais_trabalho" ADD CONSTRAINT "locais_trabalho_empregadorId_fkey" FOREIGN KEY ("empregadorId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locais_trabalho" ADD CONSTRAINT "locais_trabalho_criadoPor_fkey" FOREIGN KEY ("criadoPor") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "locais_trabalho" ADD CONSTRAINT "locais_trabalho_atualizadoPor_fkey" FOREIGN KEY ("atualizadoPor") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofencing_logs" ADD CONSTRAINT "geofencing_logs_localTrabalhoId_fkey" FOREIGN KEY ("localTrabalhoId") REFERENCES "locais_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofencing_logs" ADD CONSTRAINT "geofencing_logs_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofencing_validacoes" ADD CONSTRAINT "geofencing_validacoes_localTrabalhoId_fkey" FOREIGN KEY ("localTrabalhoId") REFERENCES "locais_trabalho"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geofencing_validacoes" ADD CONSTRAINT "geofencing_validacoes_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
