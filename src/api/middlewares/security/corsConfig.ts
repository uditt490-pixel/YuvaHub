import cors from 'cors';
import type { RequestHandler } from 'express';

const getOrigins = () => {
  const allowed = [
    'https://yuvahub.xyz',
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:3000',
    'http://127.0.0.1:3000',
  ];

  const frontendUrl = process.env.FRONTEND_URL;
  if (frontendUrl) {
    const customOrigins = frontendUrl.split(',').map((url) => url.trim()).filter(Boolean);
    allowed.push(...customOrigins);
  }

  return Array.from(new Set(allowed));
};

/**
 * Configures CORS with environment-aware settings.
 */
export const corsConfig: RequestHandler = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, or server-to-server)
    if (!origin) return callback(null, true);

    const origins = getOrigins();
    if (origins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-csrf-token'],
  credentials: true,
  maxAge: 86400, // 24 hours
});
