import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const startTime: number = Date.now();
  const method: string = req.method;
  const url: string = req.url;
  const ip: string = req.ip || 'Unknown';
  const userAgent: string = req.get('User-Agent') || 'Unknown';
  const timestamp: string = new Date().toISOString();

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip} - User-Agent: ${userAgent}`);

  if (Object.keys(req.body).length > 0) {
    console.log(`[${timestamp}] Request body:`, JSON.stringify(req.body, null, 2));
  }

  if (Object.keys(req.query).length > 0) {
    console.log(`[${timestamp}] Query params:`, JSON.stringify(req.query, null, 2));
  }

  if (Object.keys(req.params).length > 0) {
    console.log(`[${timestamp}] Path params:`, JSON.stringify(req.params, null, 2));
  }

  const originalSend = res.send;
  res.send = function(data: unknown): Response {
    const endTime: number = Date.now();
    const duration: number = endTime - startTime;
    const { statusCode }: { statusCode: number } = res;

    console.log(`[${new Date().toISOString()}] ${method} ${url} - Status: ${statusCode} - Duration: ${duration}ms`);

    if (data && typeof data === 'string') {
      try {
        const jsonData = JSON.parse(data);
        console.log(`[${new Date().toISOString()}] Response body:`, JSON.stringify(jsonData, null, 2));
      } catch {
        console.log(`[${new Date().toISOString()}] Response body:`, data);
      }
    }

    return originalSend.call(this, data);
  };

  next();
}
