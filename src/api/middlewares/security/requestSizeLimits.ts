import express from 'express';
import type { RequestHandler } from 'express';

/**
 * Configures JSON body parsing with specific size limits.
 */
export const requestSizeLimits: RequestHandler = express.json({
  limit: '10mb', // Allows up to 10MB per request, needed for resume uploads.
});
