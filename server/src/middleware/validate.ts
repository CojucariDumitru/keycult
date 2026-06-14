import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { badRequest } from '../utils/http';

/** Validate req.body against a Zod schema, replacing it with the parsed result. */
export const validateBody =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(badRequest('Validation failed', result.error.flatten().fieldErrors));
    }
    req.body = result.data;
    next();
  };

export const validateQuery =
  (schema: ZodSchema) => (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      return next(badRequest('Invalid query parameters', result.error.flatten().fieldErrors));
    }
    // Express 4 req.query is read-only via setter on some versions; attach parsed copy.
    (req as Request & { validatedQuery: unknown }).validatedQuery = result.data;
    next();
  };
