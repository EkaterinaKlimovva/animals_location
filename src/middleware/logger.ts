import type { Request, Response, NextFunction } from 'express';

export function requestLogger(req: Request, res: Response, next: NextFunction) {
  const startTime = Date.now();
  const { method, url, ip } = req;
  const userAgent = req.get('User-Agent') || 'Unknown';
  const timestamp = new Date().toISOString();

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
  res.send = function(data) {
    const endTime = Date.now();
    const duration = endTime - startTime;
    const { statusCode } = res;

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
