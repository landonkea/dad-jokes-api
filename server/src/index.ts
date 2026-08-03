// Import the Express library — this is the web framework we use to build our API server.
// Express handles all the heavy lifting of receiving HTTP requests and sending responses.
import express from "express";
// Import the CORS middleware — CORS stands for "Cross-Origin Resource Sharing."
// It lets browsers from other websites (like your React frontend) talk to this API.
import cors from "cors";
// Import helmet — sets a batch of security-related HTTP headers (like
// X-Content-Type-Options, X-Frame-Options, and a baseline Content-Security-Policy)
// with sane defaults, hardening the API against a handful of common attack classes.
import helmet from "helmet";
// Import compression — gzips response bodies (our JSON payloads especially) before
// sending them, so responses are smaller and faster over the wire.
import compression from "compression";
// Import dotenv — this library reads your .env file and loads its values into process.env.
// This is how we keep secrets (like database passwords) out of our source code.
import dotenv from "dotenv";
// Import the jokes router — this file defines all the /api/jokes/* routes.
// A "router" is like a sub-server that handles a specific group of routes.
import jokesRouter from "./routes/jokes";
// Import the error handler middleware — this catches any unhandled errors and sends a friendly response.
import { errorHandler } from "./middleware/errorHandler";
// Import the rate limiter middleware — this limits how many requests each IP address can make.
// It prevents people (or bots) from spamming our server with too many requests.
import { apiLimiter } from "./middleware/rateLimiter";
// Import our config object — it contains validated environment variables like port number and database name.
import { config } from "./config/env";

// Call dotenv.config() to load all variables from the .env file into process.env.
// This must be done early, before any other code tries to read environment variables.
// It's like opening the envelope that contains all your configuration secrets.
dotenv.config();

// Create a new Express application instance.
// "app" is the main object we'll use to define routes, middleware, and start the server.
// Think of it as the central nervous system of our API.
const app = express();

// Register helmet FIRST, before anything else touches the response — it sets security
// headers (X-Content-Type-Options: nosniff, X-Frame-Options: DENY, a baseline CSP, etc.)
// on every response this server sends, closing off a handful of common attack classes
// (clickjacking, MIME-sniffing) with zero configuration.
app.use(helmet());
// Register the CORS middleware.
// This means: for EVERY incoming request, run the CORS check first.
// It adds special headers to responses that tell the browser "it's okay for other websites to use this API."
app.use(cors());
// Register the compression middleware. It gzips response bodies (our JSON payloads)
// before they go out over the wire, so responses are smaller and load faster — especially
// noticeable on the jokes list endpoint once pagination lets it return larger pages.
app.use(compression());
// Register the JSON body parser middleware.
// This automatically parses incoming request bodies that are in JSON format.
// Without this, req.body would be undefined when someone sends JSON data.
app.use(express.json());
// Register the rate limiter on all /api routes.
// This means any request to /api/* will be checked against the rate limit (100 requests per 15 minutes).
// If someone exceeds the limit, they get a "too many requests" error.
app.use("/api", apiLimiter);
// Mount the jokes router on /api/jokes.
// This means all routes defined in the jokes file (like GET "/", POST "/") will be
// accessible at /api/jokes/ and /api/jokes/vote, etc.
app.use("/api/jokes", jokesRouter);

// Define a simple health check endpoint at GET /api/health.
// This is useful for monitoring tools and load balancers to verify the server is alive.
// "_req" means we don't use the request object — it's prefixed with "_" to signal that.
app.get("/api/health", (_req, res) => {
  // Send back a JSON response with the server's status, a fun message, and how long it's been running.
  // "res.json()" automatically sets the Content-Type header to application/json.
  res.json({
    // "status: alive" tells the client the server is up and running.
    status: "alive",
    // A humorous message to keep the dad joke theme going even in health checks.
    message: "The server is running, much like my dad's mouth at the dinner table.",
    // "process.uptime()" returns how many seconds the server has been running since it started.
    // This is helpful for monitoring how long the server has been alive.
    uptime: process.uptime(),
  });
});

// Register the error handler middleware LAST.
// Middleware runs in the order it's registered, so this catches any errors
// that weren't handled by routes above it. Think of it as the final safety net.
app.use(errorHandler);

// Start the server and listen for incoming connections on the configured port (default 3001).
// The callback function runs once the server is successfully listening.
// This is the moment the server "comes online" and starts accepting requests.
app.listen(config.port, () => {
  // Log a confirmation message so the developer knows the server started successfully.
  // The backtick (`) syntax allows embedding variables inside ${} brackets.
  console.log(`Dad Jokes API running on http://localhost:${config.port}`);
  // Log a funny warning to set the tone for this very serious joke API.
  console.log(`Warning: Joke density may cause involuntary groaning.`);
});
