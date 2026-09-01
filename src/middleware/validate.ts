/**
 * src/middleware/validate.ts
 * --------------------------
 * Robust Zod request validation middleware supporting req.body, req.params, and req.query,
 * with sanitized error responses to prevent exposing internal field structures.
 */

import { Request, Response, NextFunction } from 'express';
import { ZodError, ZodSchema } from 'zod';

interface ValidationSchema {
  body?: ZodSchema<any>;
  params?: ZodSchema<any>;
  query?: ZodSchema<any>;
}

export const validateRequest = (schema: ValidationSchema) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body);
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params);
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query);
      }
      return next();
    } catch (error) {
      if (error instanceof ZodError) {
        // Sanitize error response to prevent exposing internal field names and schema details
        return res.status(400).json({
          success: false,
          error: 'Invalid request parameters or payload.',
          details: error.issues.map((e) => ({
            message: e.message,
          })),
        });
      }
      return res.status(500).json({
        success: false,
        error: 'Internal Server Error during validation.',
      });
    }
  };
};
