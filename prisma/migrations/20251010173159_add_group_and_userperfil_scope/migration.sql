-- AlterTable
ALTER TABLE "registros_ponto" ADD COLUMN     "grupoId" TEXT,
ADD COLUMN     "usuarioPerfilId" TEXT;

-- AlterTable
ALTER TABLE "solicitacoes_hora_extra" ADD COLUMN     "grupoId" TEXT,
ADD COLUMN     "usuarioPerfilId" TEXT;

-- CreateIndex
CREATE INDEX "registros_ponto_grupoId_idx" ON "registros_ponto"("grupoId");

-- CreateIndex
CREATE INDEX "registros_ponto_usuarioPerfilId_idx" ON "registros_ponto"("usuarioPerfilId");

-- CreateIndex
CREATE INDEX "solicitacoes_hora_extra_grupoId_idx" ON "solicitacoes_hora_extra"("grupoId");

-- CreateIndex
CREATE INDEX "solicitacoes_hora_extra_usuarioPerfilId_idx" ON "solicitacoes_hora_extra"("usuarioPerfilId");

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_ponto" ADD CONSTRAINT "registros_ponto_usuarioPerfilId_fkey" FOREIGN KEY ("usuarioPerfilId") REFERENCES "usuarios_perfis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_hora_extra" ADD CONSTRAINT "solicitacoes_hora_extra_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "solicitacoes_hora_extra" ADD CONSTRAINT "solicitacoes_hora_extra_usuarioPerfilId_fkey" FOREIGN KEY ("usuarioPerfilId") REFERENCES "usuarios_perfis"("id") ON DELETE SET NULL ON UPDATE CASCADE;
