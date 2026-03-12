import { PrismaClient } from '../../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import 'dotenv/config';

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL || 'http://localhost:5432/test';

// Parse the URL to get connection parameters
const parseDatabaseUrl = (url: string) => {
  const match = url.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) {
    throw new Error('Invalid DATABASE_URL format');
  }
  return {
    user: match[1],
    password: match[2],
    host: match[3],
    port: parseInt(match[4], 10),
    database: match[5],
  };
};

const dbConfig = parseDatabaseUrl(databaseUrl);

// Create a connection pool
const pool = new Pool({
  connectionString: databaseUrl,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  user: dbConfig.user,
  password: dbConfig.password,
});

const adapter = new PrismaPg(pool);

// Create Prisma client for tests
export const testPrisma = new PrismaClient({
  adapter,
  log: ['error'],
});

/**
 * Set up the test database connection
 */
export async function setupTestDatabase(): Promise<void> {
  try {
    await testPrisma.$connect();
    console.log('Test database connected successfully');
  } catch (error) {
    console.error('Test database connection failed:', error);
    throw error;
  }
}

/**
 * Disconnect from the test database
 */
export async function disconnectTestDatabase(): Promise<void> {
  try {
    await testPrisma.$disconnect();
    await pool.end();
    console.log('Test database disconnected successfully');
  } catch (error) {
    console.error('Test database disconnect failed:', error);
    throw error;
  }
}
