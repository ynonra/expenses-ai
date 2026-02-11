import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Lazy initialization - only create client when actually used
let _prisma: PrismaClient | null = null;

export const getPrisma = () => {
  if (!_prisma && (process.env.POSTGRES_PRISMA_URL || process.env.DATABASE_URL)) {
    _prisma = new PrismaClient();
  }
  return _prisma;
}

export const prisma = new Proxy({} as PrismaClient, {
  get: (_target, prop) => {
    const client = getPrisma();
    if (!client) {
      throw new Error('Database not configured - missing POSTGRES_PRISMA_URL or DATABASE_URL');
    }
    return (client as any)[prop];
  }
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
