-- CreateTable
CREATE TABLE "Lab" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "website" TEXT,
    "headquarters" TEXT,

    CONSTRAINT "Lab_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Model" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "contextWindow" INTEGER NOT NULL,
    "maxOutputTokens" INTEGER NOT NULL,
    "modelType" TEXT NOT NULL,
    "capabilities" TEXT[],
    "modalities" TEXT[],
    "releaseDate" TIMESTAMP(3) NOT NULL,
    "labId" TEXT NOT NULL,

    CONSTRAINT "Model_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Provider" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "website" TEXT,
    "description" TEXT,

    CONSTRAINT "Provider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ModelProvider" (
    "id" TEXT NOT NULL,
    "inputPricePer1M" DOUBLE PRECISION NOT NULL,
    "outputPricePer1M" DOUBLE PRECISION NOT NULL,
    "latencyMs" INTEGER NOT NULL,
    "throughputTps" INTEGER NOT NULL,
    "modelId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,

    CONSTRAINT "ModelProvider_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenchmarkScore" (
    "id" TEXT NOT NULL,
    "benchmarkName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "maxScore" DOUBLE PRECISION NOT NULL,
    "modelId" TEXT NOT NULL,

    CONSTRAINT "BenchmarkScore_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lab_slug_key" ON "Lab"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Model_slug_key" ON "Model"("slug");

-- CreateIndex
CREATE INDEX "Model_labId_idx" ON "Model"("labId");

-- CreateIndex
CREATE UNIQUE INDEX "Provider_slug_key" ON "Provider"("slug");

-- CreateIndex
CREATE INDEX "ModelProvider_modelId_idx" ON "ModelProvider"("modelId");

-- CreateIndex
CREATE INDEX "ModelProvider_providerId_idx" ON "ModelProvider"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "ModelProvider_modelId_providerId_key" ON "ModelProvider"("modelId", "providerId");

-- CreateIndex
CREATE INDEX "BenchmarkScore_modelId_idx" ON "BenchmarkScore"("modelId");

-- AddForeignKey
ALTER TABLE "Model" ADD CONSTRAINT "Model_labId_fkey" FOREIGN KEY ("labId") REFERENCES "Lab"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProvider" ADD CONSTRAINT "ModelProvider_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ModelProvider" ADD CONSTRAINT "ModelProvider_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenchmarkScore" ADD CONSTRAINT "BenchmarkScore_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "Model"("id") ON DELETE CASCADE ON UPDATE CASCADE;
