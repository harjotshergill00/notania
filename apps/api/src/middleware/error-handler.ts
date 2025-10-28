import { Request, Response, NextFunction } from 'express';

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  console.error('Unhandled error', error);
  const status = typeof error.status === 'number' ? error.status : 500;
  res.status(status).json({ message: error.message ?? 'Internal server error' });
}
