import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import config from '../config/config';
import { PrismaClient } from '../generated/prisma/client';

// Use PostgreSQL for both development and testing
const pool = new Pool({
  connectionString: config.db.url,
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'test' ? ['error'] : ['query', 'info', 'warn', 'error'],
});

// Initialize database connection with retry logic
async function connectDB() {
  const maxRetries = 5;
  const retryDelay = 2000; // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await prisma.$connect();
      console.log('Database connected successfully');
      return;
    } catch (error) {
      console.error(`Database connection attempt ${attempt}/${maxRetries} failed:`, error instanceof Error ? error.message : String(error));
      
      if (attempt === maxRetries) {
        console.error('Max retry attempts reached. Database connection failed.');
        throw error;
      }
      
      console.log(`Retrying in ${retryDelay / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
}

async function disconnectDB() {
  try {
    await prisma.$disconnect();
    console.log('Database disconnected');
  } catch (error) {
    console.error('Error during database disconnection:', error instanceof Error ? error.message : String(error));
  }
}

export { connectDB, disconnectDB };
