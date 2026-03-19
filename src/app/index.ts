import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './database';
import { errorHandler } from '../middleware/errorHandler';
import { requestLogger } from '../middleware/logger';
import { router } from '../routes';

dotenv.config();

const app = express();

// Export app for testing purposes only
export { app };

app.use(cors());
app.use(express.json());
app.use(requestLogger);

// API routes
app.use('/', router);


// Catch-all 404 handler for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Global error handler should be registered after routes
app.use(errorHandler);

const port = process.env.NODE_ENV === 'test'
  ? 3001
  : (process.env.PORT ? Number(process.env.PORT) : 3000);

async function startServer() {
  try {
    console.log('🚀 Starting server...');
    console.log(`📊 Database URL: ${process.env.DATABASE_URL || 'Not set'}`);
    console.log(`🌐 Database Host: ${process.env.DB_HOST || 'postgres'}`);
    console.log(`🔌 Database Port: ${process.env.DB_PORT || '5432'}`);

    await connectDB();

    app.listen(port, '0.0.0.0', () => {
      console.log(`✅ Server is running on port ${port}`);
      console.log(`📚 API documentation available at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    console.error('💡 Make sure PostgreSQL is running and accessible');
    process.exit(1);
  }
}

process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  await disconnectDB();
  process.exit(0);
});

// Only start server if this file is run directly (not when imported for tests)
if (import.meta.url === `file://${process.argv[1]}`) {
  (async () => {
    await startServer();
  })();
}
