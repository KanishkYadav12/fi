import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log the error for observability
  console.error(`[Error] ${err.name || 'UnknownError'}: ${err.message}`);

  // Handle Zod Validation Errors
  if (err instanceof ZodError) {
    return res.status(400).json({
      error: 'Validation Error',
      details: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    });
  }

  // Handle MongoDB Unique Constraint Violation
  if (err.code === 11000) {
    return res.status(409).json({
      error: 'Conflict',
      message: 'A monitor with this URL already exists.',
    });
  }

  // Default Error Response
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';

  res.status(status).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
