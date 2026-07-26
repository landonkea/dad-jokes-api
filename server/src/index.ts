import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jokesRouter from "./routes/jokes";
import { errorHandler } from "./middleware/errorHandler";
import { apiLimiter } from "./middleware/rateLimiter";
import { config } from "./config/env";

dotenv.config();

const app = express();

// Register the CORS middleware.
// This means: for EVERY incoming request, run the CORS check first.
// It adds special headers to responses that tell the browser "it's okay for other websites to use this API."
app.use(cors());
app.use(express.json());
app.use("/api", apiLimiter);
app.use("/api/jokes", jokesRouter);

app.get("/api/health", (_req, res) => {
  res.json({
    status: "alive",
    message: "The server is running, much like my dad's mouth at the dinner table.",
    uptime: process.uptime(),
  });
});

app.use(errorHandler);

app.listen(config.port, () => {
  console.log(`Dad Jokes API running on http://localhost:${config.port}`);
  console.log(`Warning: Joke density may cause involuntary groaning.`);
});
