import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis;

const prisma = globalForPrisma.__crmTattooPrisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.__crmTattooPrisma = prisma;
}

export default prisma;
