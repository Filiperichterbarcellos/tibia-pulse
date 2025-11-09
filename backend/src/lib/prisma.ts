// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// Armazena uma única instância global do Prisma
const globalForPrisma = global as unknown as { prisma?: PrismaClient }

// Reaproveita se já existir, senão cria uma nova
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['error', 'warn'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
