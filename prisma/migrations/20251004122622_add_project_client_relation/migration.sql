-- CreateTable
CREATE TABLE "project_clients" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "project_clients_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "project_clients_userId_idx" ON "project_clients"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "project_clients_projectId_userId_key" ON "project_clients"("projectId", "userId");

-- AddForeignKey
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "project_clients" ADD CONSTRAINT "project_clients_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
