import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDB, disconnectDB } from './database';
import { errorHandler } from '../middleware/errorHandler';
import { requestLogger } from '../middleware/logger';
import { router } from '../routes';

dotenv.config();

const app = express();

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

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

async function startServer() {
  try {
    await connectDB();

    app.listen(port, '0.0.0.0', () => {
      //   console.log(`🚀 Server is running on port ${port}`);
      console.log(`📚 API documentation available at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
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

await startServer();
