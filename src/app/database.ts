import { PrismaClient } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import config from '../config/config';

const adapter = new PrismaPg({
  connectionString: config.db.url,
});

const prisma = new PrismaClient({
  adapter,
  log: ['query', 'info', 'warn', 'error'],
});


async function connectDB() {
  try {
    console.log('Database connecting...');
    console.log('Using DATABASE_URL:', config.db.url);
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
}

async function disconnectDB() {
  await prisma.$disconnect();
  console.log('🔌 Database disconnected');
}

export { prisma, connectDB, disconnectDB };
