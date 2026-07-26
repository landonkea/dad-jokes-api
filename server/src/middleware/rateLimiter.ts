import rateLimit from "express-rate-limit";

// Limits each IP to 100 requests per 15 minutes
// Prevents abuse and keeps the server healthy
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    success: false,
    error: "Too many requests. Take a breath and try again in a few minutes.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for voting — 30 votes per 15 minutes per IP
export const voteLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: "Slow down on the voting. Even democracies have limits.",
  },
});
