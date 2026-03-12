import dotenv from 'dotenv';

dotenv.config();

// Helper function to detect if running in Docker container
function isDockerEnvironment(): boolean {
  // Check for Docker-specific environment variables or files
  return process.env.DOCKER_ENV === 'true' || 
         process.env.NODE_ENV === 'production' ||
         process.env.DB_HOST === 'postgres' ||
         (process.env.DATABASE_URL?.includes('@postgres:') ?? false);
}

const config = {
  port: Number(process.env.PORT) || 8080,
  host: process.env.HOST ?? 'localhost',
  apiKey: process.env.API_KEY ?? 'secret',
  db: {
    host: process.env.DB_HOST ?? (isDockerEnvironment() ? 'postgres' : 'localhost'),
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'pw',
    database: process.env.DB_NAME ?? 'animals_location',
    url: process.env.DATABASE_URL ?? `postgresql://${process.env.DB_USER ?? 'postgres'}:${process.env.DB_PASSWORD ?? 'pw'}@${process.env.DB_HOST ?? (isDockerEnvironment() ? 'postgres' : 'localhost')}:${Number(process.env.DB_PORT) || 5432}/${process.env.DB_NAME ?? 'animals_location'}`,
  },
};

export default config;
