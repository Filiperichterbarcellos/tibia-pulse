-- Enable OAuth providers: add nullable email/password, provider columns and avatar support
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'DISCORD');

ALTER TABLE "User"
  ALTER COLUMN "email" DROP NOT NULL,
  ALTER COLUMN "password" DROP NOT NULL,
  ADD COLUMN "avatarUrl" TEXT,
  ADD COLUMN "provider" "AuthProvider",
  ADD COLUMN "providerAccountId" TEXT;

CREATE UNIQUE INDEX "User_provider_providerAccountId_key" ON "User"("provider", "providerAccountId");
