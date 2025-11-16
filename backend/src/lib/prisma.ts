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

async function ensureFavoriteSnapshotColumn() {
  try {
    const result = await prisma.$queryRaw<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = current_schema()
          AND lower(table_name) = 'favorite'
          AND column_name = 'snapshot'
      ) as "exists"
    `
    const hasColumn = result?.[0]?.exists
    if (!hasColumn) {
      await prisma.$executeRawUnsafe('ALTER TABLE "Favorite" ADD COLUMN "snapshot" JSONB')
      console.info('[prisma] coluna Favorite.snapshot criada automaticamente')
    }
  } catch (err: any) {
    const msg = typeof err?.message === 'string' ? err.message : ''
    if (msg.includes("Can't reach database server")) {
      console.warn('[prisma] snapshot check ignorado (sem conexão com o banco)')
      return
    }
    console.error('[prisma] não foi possível garantir Favorite.snapshot', err)
  }
}

void ensureFavoriteSnapshotColumn()
