-- CreateTable
CREATE TABLE "Tenent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "subdomain" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "password" TEXT NOT NULL,
    "name" TEXT,
    "role" TEXT NOT NULL DEFAULT 'member',
    "verifyToken" TEXT,
    "verifyCode" TEXT,
    "verifyCodeExpiry" DATETIME,
    "tenentId" TEXT NOT NULL,
    CONSTRAINT "User_tenentId_fkey" FOREIGN KEY ("tenentId") REFERENCES "Tenent" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "dob" DATETIME NOT NULL,
    "level" TEXT NOT NULL,
    "jobTitle" TEXT NOT NULL,
    "branch" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "subDepartment" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "jobDescription" TEXT NOT NULL,
    "servicePeriod" TEXT NOT NULL,
    "joinDate" DATETIME NOT NULL,
    "officialContact" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "UserProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Tenent_subdomain_key" ON "Tenent"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "UserProfile_userId_key" ON "UserProfile"("userId");
