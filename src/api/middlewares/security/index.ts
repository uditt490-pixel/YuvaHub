import cookieParser from 'cookie-parser';
import { helmetConfig } from './helmetConfig.js';
import { corsConfig } from './corsConfig.js';
import { csrfProtection } from './csrfProtection.js';
import { requestSizeLimits } from './requestSizeLimits.js';
import { responseHeaderSanitizer } from './responseHeaderSanitizer.js';
import type { RequestHandler } from 'express';

/**
 * Composes all security middlewares into a single pipeline for express.
 */
export const securityPipeline = (): RequestHandler[] => {
  return [
    responseHeaderSanitizer,
    helmetConfig,
    corsConfig,
    cookieParser(),
    csrfProtection,
    requestSizeLimits,
  ];
};
