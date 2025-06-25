-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Developer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "emailAddress" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "cityArea" TEXT NOT NULL,
    "cityPin" INTEGER NOT NULL,
    "department" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    CONSTRAINT "Developer_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Developer_emailAddress_key" ON "Developer"("emailAddress");
