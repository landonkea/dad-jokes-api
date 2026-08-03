// Builds and exports the configured Express app, WITHOUT starting it listening on a port.
// Split out of index.ts so integration tests (see __tests__/*.integration.test.ts) can import
// the exact same app — middleware, routers, error handler and all — via supertest, instead of
// re-declaring a partial copy that could drift from what actually runs in production.
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import jokesRouter from "./routes/jokes";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";

const app = express();

// Security headers on every response.
app.use(helmet());
// Allow the React frontend (or anyone) to call this API cross-origin.
app.use(cors());
// Gzip response bodies.
app.use(compression());
// Parse JSON request bodies.
app.use(express.json());
// Rate limit all /api routes.
app.use("/api", apiLimiter);
// Mount the jokes routes.
app.use("/api/jokes", jokesRouter);

// Health check endpoint.
app.get("/api/health", (_req, res) => {
  res.json({
    status: "alive",
    message: "The server is running, much like my dad's mouth at the dinner table.",
    uptime: process.uptime(),
  });
});

// Catch-all error handler — must be registered last.
app.use(errorHandler);

export default app;
