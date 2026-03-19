import express from 'express';
import cors from 'cors';
import { errorHandler } from '../middleware/errorHandler';
import { requestLogger } from '../middleware/logger';
import { router } from '../routes';

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

export { app };
