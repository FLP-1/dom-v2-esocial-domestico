-- CreateTable
CREATE TABLE "configuracao_perfil" (
    "id" TEXT NOT NULL,
    "perfilId" TEXT NOT NULL,
    "chave" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "prioridade" INTEGER NOT NULL DEFAULT 1,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_perfil_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_geolocalizacao" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "grupoId" TEXT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_geolocalizacao_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracao_antifraude" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "grupoId" TEXT,
    "chave" TEXT NOT NULL,
    "valor" TEXT NOT NULL,
    "descricao" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracao_antifraude_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracao_perfil_perfilId_chave_key" ON "configuracao_perfil"("perfilId", "chave");

-- AddForeignKey
ALTER TABLE "configuracao_perfil" ADD CONSTRAINT "configuracao_perfil_perfilId_fkey" FOREIGN KEY ("perfilId") REFERENCES "perfis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_geolocalizacao" ADD CONSTRAINT "configuracao_geolocalizacao_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_geolocalizacao" ADD CONSTRAINT "configuracao_geolocalizacao_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_antifraude" ADD CONSTRAINT "configuracao_antifraude_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "configuracao_antifraude" ADD CONSTRAINT "configuracao_antifraude_grupoId_fkey" FOREIGN KEY ("grupoId") REFERENCES "grupos"("id") ON DELETE CASCADE ON UPDATE CASCADE;
