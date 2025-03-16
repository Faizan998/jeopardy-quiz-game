import { PrismaClient } from '@prisma/client';

// PrismaClient is attached to the `global` object in development to prevent
// exhausting your database connection limit.
// Learn more: https://pris.ly/d/help/next-js-best-practices

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query', 'error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Add error handling middleware
prisma.$use(async (params, next) => {
  try {
    return await next(params);
  } catch (error: any) {
    // Log the error
    console.error(`Prisma Error in ${params.model}.${params.action}:`, error);
    
    // Rethrow the error
    throw error;
  }
});

// Handle process exit
process.on('beforeExit', async () => {
  console.log('Disconnecting Prisma Client');
  await prisma.$disconnect();
});

export default prisma;
