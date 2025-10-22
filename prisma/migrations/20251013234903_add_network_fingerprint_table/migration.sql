-- CreateTable
CREATE TABLE "network_fingerprints" (
    "id" TEXT NOT NULL,
    "usuarioId" TEXT,
    "connectionType" VARCHAR(50),
    "effectiveType" VARCHAR(50),
    "downlink" DOUBLE PRECISION,
    "rtt" INTEGER,
    "ipAddress" VARCHAR(45),
    "timezone" VARCHAR(100),
    "language" VARCHAR(20),
    "userAgent" TEXT,
    "platform" VARCHAR(100),
    "screenResolution" VARCHAR(50),
    "connectionSpeed" VARCHAR(50),
    "connectionQuality" VARCHAR(50),
    "networkLatency" INTEGER,
    "bandwidthEstimate" DOUBLE PRECISION,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "sessionId" VARCHAR(100),
    "riskScore" INTEGER,
    "confidence" INTEGER,
    "anomalies" TEXT,
    "isFraud" BOOLEAN NOT NULL DEFAULT false,
    "fraudReasons" TEXT,
    "fraudConfidence" INTEGER,
    "criadoEm" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "atualizadoEm" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "network_fingerprints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "network_fingerprints_usuarioId_idx" ON "network_fingerprints"("usuarioId");

-- CreateIndex
CREATE INDEX "network_fingerprints_ipAddress_idx" ON "network_fingerprints"("ipAddress");

-- CreateIndex
CREATE INDEX "network_fingerprints_sessionId_idx" ON "network_fingerprints"("sessionId");

-- CreateIndex
CREATE INDEX "network_fingerprints_timestamp_idx" ON "network_fingerprints"("timestamp");

-- CreateIndex
CREATE INDEX "network_fingerprints_isFraud_idx" ON "network_fingerprints"("isFraud");

-- CreateIndex
CREATE INDEX "network_fingerprints_riskScore_idx" ON "network_fingerprints"("riskScore");

-- AddForeignKey
ALTER TABLE "network_fingerprints" ADD CONSTRAINT "network_fingerprints_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "usuarios"("id") ON DELETE SET NULL ON UPDATE CASCADE;
