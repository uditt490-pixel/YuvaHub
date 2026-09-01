import cors from 'cors';
import type { RequestHandler } from 'express';

const getOrigins = () => {
  if (process.env.NODE_ENV === 'production') {
    const frontendUrl = process.env.FRONTEND_URL;
    if (frontendUrl) {
      return [frontendUrl];
    }
    // Fallback restrictive origin for prod if not explicitly set
    return ['https://yuvahub.xyz'];
  }
  // Development mode
  return '*';
};

/**
 * Configures CORS with environment-aware settings.
 */
export const corsConfig: RequestHandler = cors({
  origin: getOrigins(),
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
  maxAge: 86400, // 24 hours
});
