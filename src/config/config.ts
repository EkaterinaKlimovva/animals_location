import dotenv from 'dotenv';

dotenv.config();

const config = {
  port: Number(process.env.PORT) || 8080,
  host: process.env.HOST ?? 'localhost',
  apiKey: process.env.API_KEY ?? 'secret',
  db: {
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    url: process.env.DATABASE_URL,
  },
};

export default config;
