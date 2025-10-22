-- CreateTable
CREATE TABLE "device_fingerprints" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "fingerprintHash" VARCHAR(255) NOT NULL,
    "canvasFingerprint" TEXT,
    "webglFingerprint" TEXT,
    "audioFingerprint" TEXT,
    "platform" VARCHAR(100),
    "cpuCores" INTEGER,
    "memoria" INTEGER,
    "telaResolucao" VARCHAR(50),
    "telaColorDepth" INTEGER,
    "timezone" VARCHAR(100),
    "idioma" VARCHAR(20),
    "fontesDetectadas" TEXT[],
    "userAgent" TEXT,
    "plugins" JSONB,
    "navegador" VARCHAR(100),
    "navegadorVersao" VARCHAR(50),
    "sistemaOperacional" VARCHAR(100),
    "dispositivoTipo" VARCHAR(50),
    "touchSupport" BOOLEAN NOT NULL DEFAULT false,
    "webglVendor" VARCHAR(100),
    "webglRenderer" VARCHAR(100),
    "confiavel" BOOLEAN NOT NULL DEFAULT false,
    "vezesVisto" INTEGER NOT NULL DEFAULT 1,
    "primeiraVez" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaVez" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "motivoBloqueio" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "device_fingerprints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risk_analysis" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "fingerprintId" TEXT,
    "sessionId" TEXT,
    "ipAddress" VARCHAR(45) NOT NULL,
    "ipAnaliseId" TEXT,
    "geolocalizacaoId" TEXT,
    "comportamentoId" TEXT,
    "tipoEvento" VARCHAR(50) NOT NULL,
    "scoreFinal" DECIMAL(5,4) NOT NULL,
    "nivelRisco" VARCHAR(20) NOT NULL,
    "scoreFingerprint" DECIMAL(5,4),
    "scoreIP" DECIMAL(5,4),
    "scoreGeolocalizacao" DECIMAL(5,4),
    "scoreComportamento" DECIMAL(5,4),
    "scoreTemporal" DECIMAL(5,4),
    "sinaisAlerta" TEXT[],
    "dispositivoNovo" BOOLEAN NOT NULL DEFAULT false,
    "ipNovo" BOOLEAN NOT NULL DEFAULT false,
    "localizacaoNova" BOOLEAN NOT NULL DEFAULT false,
    "velocidadeImpossivel" BOOLEAN NOT NULL DEFAULT false,
    "horaAtipica" BOOLEAN NOT NULL DEFAULT false,
    "vpnDetectado" BOOLEAN NOT NULL DEFAULT false,
    "proxyDetectado" BOOLEAN NOT NULL DEFAULT false,
    "datacenterDetectado" BOOLEAN NOT NULL DEFAULT false,
    "botDetectado" BOOLEAN NOT NULL DEFAULT false,
    "acaoTomada" VARCHAR(100),
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "notificadoUsuario" BOOLEAN NOT NULL DEFAULT false,
    "dadosCompletos" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "risk_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "geolocation_history" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "fingerprintId" TEXT,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "precisao" DOUBLE PRECISION,
    "altitude" DOUBLE PRECISION,
    "altitudePrecisao" DOUBLE PRECISION,
    "velocidade" DOUBLE PRECISION,
    "direcao" DOUBLE PRECISION,
    "cidade" VARCHAR(100),
    "estado" VARCHAR(100),
    "pais" VARCHAR(100),
    "codigoPais" VARCHAR(2),
    "cep" VARCHAR(20),
    "enderecoCompleto" TEXT,
    "distanciaUltimaKm" DOUBLE PRECISION,
    "tempoDecorridoMin" DOUBLE PRECISION,
    "velocidadeCalculadaKmH" DOUBLE PRECISION,
    "suspeita" BOOLEAN NOT NULL DEFAULT false,
    "motivoSuspeita" TEXT,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "geolocation_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ip_analysis" (
    "id" TEXT NOT NULL,
    "ipAddress" VARCHAR(45) NOT NULL,
    "tipo" VARCHAR(20),
    "versaoIP" VARCHAR(10),
    "hostname" VARCHAR(255),
    "isp" VARCHAR(255),
    "asn" VARCHAR(50),
    "asnOrganizacao" VARCHAR(255),
    "cidade" VARCHAR(100),
    "regiao" VARCHAR(100),
    "pais" VARCHAR(100),
    "codigoPais" VARCHAR(2),
    "continente" VARCHAR(50),
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "timezone" VARCHAR(100),
    "isVPN" BOOLEAN NOT NULL DEFAULT false,
    "isProxy" BOOLEAN NOT NULL DEFAULT false,
    "isTor" BOOLEAN NOT NULL DEFAULT false,
    "isDatacenter" BOOLEAN NOT NULL DEFAULT false,
    "isRelay" BOOLEAN NOT NULL DEFAULT false,
    "isMobile" BOOLEAN NOT NULL DEFAULT false,
    "scoreAbuso" DECIMAL(5,4),
    "scoreRisco" DECIMAL(5,4),
    "vezesVisto" INTEGER NOT NULL DEFAULT 1,
    "primeiraVez" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ultimaVez" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bloqueado" BOOLEAN NOT NULL DEFAULT false,
    "motivoBloqueio" TEXT,
    "dadosCompletos" JSONB,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ip_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "behavior_analysis" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "sessionId" TEXT,
    "fingerprintId" TEXT,
    "tipoAnalise" VARCHAR(50) NOT NULL,
    "velocidadeDigitacaoMed" INTEGER,
    "velocidadeDigitacaoDesvio" INTEGER,
    "velocidadeMouseMed" DOUBLE PRECISION,
    "padraoCliques" JSONB,
    "tempoEntreAcoes" JSONB,
    "sequenciaEventos" JSONB,
    "eventosTotais" INTEGER NOT NULL DEFAULT 0,
    "tempoSessaoSegundos" INTEGER,
    "paginasVisitadas" INTEGER,
    "acionamentosTeclas" JSONB,
    "movimentosMouse" INTEGER,
    "scrollsRealizados" INTEGER,
    "regularidadeExcessiva" BOOLEAN NOT NULL DEFAULT false,
    "acoesMuitoRapidas" BOOLEAN NOT NULL DEFAULT false,
    "padraoHumano" BOOLEAN NOT NULL DEFAULT true,
    "scoreBotProbabilidade" DECIMAL(5,4),
    "scoreNormalidade" DECIMAL(5,4),
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "behavior_analysis_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "device_fingerprints_fingerprintHash_key" ON "device_fingerprints"("fingerprintHash");

-- CreateIndex
CREATE INDEX "device_fingerprints_usuarioId_idx" ON "device_fingerprints"("usuarioId");

-- CreateIndex
CREATE INDEX "device_fingerprints_fingerprintHash_idx" ON "device_fingerprints"("fingerprintHash");

-- CreateIndex
CREATE INDEX "device_fingerprints_confiavel_idx" ON "device_fingerprints"("confiavel");

-- CreateIndex
CREATE INDEX "device_fingerprints_primeiraVez_idx" ON "device_fingerprints"("primeiraVez");

-- CreateIndex
CREATE INDEX "risk_analysis_usuarioId_idx" ON "risk_analysis"("usuarioId");

-- CreateIndex
CREATE INDEX "risk_analysis_fingerprintId_idx" ON "risk_analysis"("fingerprintId");

-- CreateIndex
CREATE INDEX "risk_analysis_ipAddress_idx" ON "risk_analysis"("ipAddress");

-- CreateIndex
CREATE INDEX "risk_analysis_nivelRisco_idx" ON "risk_analysis"("nivelRisco");

-- CreateIndex
CREATE INDEX "risk_analysis_tipoEvento_idx" ON "risk_analysis"("tipoEvento");

-- CreateIndex
CREATE INDEX "risk_analysis_criadoEm_idx" ON "risk_analysis"("criadoEm");

-- CreateIndex
CREATE INDEX "risk_analysis_scoreFinal_idx" ON "risk_analysis"("scoreFinal");

-- CreateIndex
CREATE INDEX "geolocation_history_usuarioId_idx" ON "geolocation_history"("usuarioId");

-- CreateIndex
CREATE INDEX "geolocation_history_fingerprintId_idx" ON "geolocation_history"("fingerprintId");

-- CreateIndex
CREATE INDEX "geolocation_history_criadoEm_idx" ON "geolocation_history"("criadoEm");

-- CreateIndex
CREATE INDEX "geolocation_history_suspeita_idx" ON "geolocation_history"("suspeita");

-- CreateIndex
CREATE UNIQUE INDEX "ip_analysis_ipAddress_key" ON "ip_analysis"("ipAddress");

-- CreateIndex
CREATE INDEX "ip_analysis_ipAddress_idx" ON "ip_analysis"("ipAddress");

-- CreateIndex
CREATE INDEX "ip_analysis_isVPN_idx" ON "ip_analysis"("isVPN");

-- CreateIndex
CREATE INDEX "ip_analysis_isProxy_idx" ON "ip_analysis"("isProxy");

-- CreateIndex
CREATE INDEX "ip_analysis_isDatacenter_idx" ON "ip_analysis"("isDatacenter");

-- CreateIndex
CREATE INDEX "ip_analysis_scoreRisco_idx" ON "ip_analysis"("scoreRisco");

-- CreateIndex
CREATE INDEX "ip_analysis_bloqueado_idx" ON "ip_analysis"("bloqueado");

-- CreateIndex
CREATE INDEX "behavior_analysis_usuarioId_idx" ON "behavior_analysis"("usuarioId");

-- CreateIndex
CREATE INDEX "behavior_analysis_sessionId_idx" ON "behavior_analysis"("sessionId");

-- CreateIndex
CREATE INDEX "behavior_analysis_fingerprintId_idx" ON "behavior_analysis"("fingerprintId");

-- CreateIndex
CREATE INDEX "behavior_analysis_scoreBotProbabilidade_idx" ON "behavior_analysis"("scoreBotProbabilidade");

-- CreateIndex
CREATE INDEX "behavior_analysis_criadoEm_idx" ON "behavior_analysis"("criadoEm");

-- AddForeignKey
ALTER TABLE "device_fingerprints" ADD CONSTRAINT "device_fingerprints_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_analysis" ADD CONSTRAINT "risk_analysis_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_analysis" ADD CONSTRAINT "risk_analysis_fingerprintId_fkey" FOREIGN KEY ("fingerprintId") REFERENCES "device_fingerprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_analysis" ADD CONSTRAINT "risk_analysis_ipAnaliseId_fkey" FOREIGN KEY ("ipAnaliseId") REFERENCES "ip_analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_analysis" ADD CONSTRAINT "risk_analysis_geolocalizacaoId_fkey" FOREIGN KEY ("geolocalizacaoId") REFERENCES "geolocation_history"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risk_analysis" ADD CONSTRAINT "risk_analysis_comportamentoId_fkey" FOREIGN KEY ("comportamentoId") REFERENCES "behavior_analysis"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geolocation_history" ADD CONSTRAINT "geolocation_history_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "geolocation_history" ADD CONSTRAINT "geolocation_history_fingerprintId_fkey" FOREIGN KEY ("fingerprintId") REFERENCES "device_fingerprints"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "behavior_analysis" ADD CONSTRAINT "behavior_analysis_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
