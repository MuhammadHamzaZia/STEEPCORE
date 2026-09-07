import rateLimit from 'express-rate-limit';

// Global Rate Limiting
export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});

// API-specific Rate Limiting (e.g., for general API)
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 per minute
  message: { error: 'Too many API requests. Please slow down.' }
});

// AI Generation Limiter
export const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 generation requests per minute
  message: { error: 'Too many AI generation requests. Please try again in a minute.' }
});

// Checkout Limiter
export const checkoutLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 checkouts per minute
  message: { error: 'Too many checkout attempts. Please wait.' }
});

// Strict Limiter for Contributions & Spamy endpoints
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // Limit each IP to 5 requests per hour
  message: { error: 'Strict rate limit exceeded. Please try again later.' }
});
