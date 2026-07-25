// We need the "express" package — it's a framework that makes it easy to build web servers.
// Instead of handling raw HTTP requests by hand (which is tedious), Express gives us
// helpful tools like routers, middleware, and request/response objects.
// Think of Express like a restaurant kitchen — it organizes all the work behind the scenes.
import express from "express";

// We need the "cors" package to handle Cross-Origin Resource Sharing.
// "CORS" is a security feature that controls which websites can talk to our server.
// By default, a server only allows requests from the same origin (same website).
// If our frontend runs on "localhost:3000" and our API runs on "localhost:3001",
// the browser would BLOCK the requests without CORS enabled.
// This middleware says "allow everyone to talk to us" — like unlocking the front door.
import cors from "cors";

// We need "dotenv" to load environment variables from a .env file.
// Environment variables are settings that live outside your code (like database passwords,
// port numbers, etc.) so you don't hard-code sensitive info in your source files.
import dotenv from "dotenv";

// Import the jokes router — this contains all the joke-related routes
// (GET /api/jokes, POST /api/jokes, DELETE /api/jokes/:id, etc.).
import jokesRouter from "./routes/jokes";

// Import the error handler middleware — this catches any unhandled errors
// and sends a clean error response to the client instead of crashing.
import { errorHandler } from "./middleware/errorHandler";

// Load the .env file's contents into process.env.
// After this line runs, you can access process.env.PORT, process.env.DB_USER, etc.
dotenv.config();

// Create an Express application instance.
// This "app" object is where we register all our routes, middleware, and settings.
// Think of it like setting up a new restaurant: you're defining the menu (routes),
// the seating rules (middleware), and the hours (port number).
const app = express();

// Set the port number for the server to listen on.
// We try to read PORT from the .env file first. If it's not there, we default to 3001.
// "parseInt" converts the string (e.g., "3001") into a number (3001).
// Servers need a port number — it's like a house address, but for network traffic.
const PORT = parseInt(process.env.PORT || "3001");

// Register the CORS middleware.
// This means: for EVERY incoming request, run the CORS check first.
// It adds special headers to responses that tell the browser "it's okay for other websites to use this API."
app.use(cors());

// Register the JSON parsing middleware.
// This middleware reads the body of incoming requests and automatically parses
// JSON strings into JavaScript objects.
// For example, if someone sends '{"setup": "Hello", "punchline": "World"}',
// Express would normally give you a raw string. This middleware converts it to
// an actual JavaScript object so you can do req.body.setup and get "Hello".
// Think of it like a translator — it converts the language the client speaks (JSON)
// into the language your code understands (JavaScript objects).
app.use(express.json());

// Mount the jokes router on the "/api/jokes" path.
// This means ALL routes defined in jokes.ts will be prefixed with "/api/jokes."
// For example:
//   - GET "/" in jokes.ts  → becomes GET  "/api/jokes"
//   - GET "/random" in jokes.ts → becomes GET  "/api/jokes/random"
//   - POST "/" in jokes.ts → becomes POST "/api/jokes"
//   - DELETE "/:id" in jokes.ts → becomes DELETE "/api/jokes/42"
// Think of it like a sub-menu at a restaurant — all the joke routes are grouped together.
app.use("/api/jokes", jokesRouter);

// Define a simple health check endpoint at "/api/health".
// This is like a "pulse check" — clients can hit this route to see if the server is alive and running.
// It's common practice for APIs to have a health check route.
app.get("/api/health", (_req, res) => {
  // Send back a JSON response with status info.
  // "status: alive" tells the client "yes, I'm running."
  // "message" adds some personality with a dad joke.
  // "uptime" tells how long the server has been running (in seconds) — useful for monitoring.
  // "process.uptime()" is a built-in Node.js function that returns seconds since the server started.
  res.json({
    status: "alive",
    message: "The server is running, much like my dad's mouth at the dinner table.",
    uptime: process.uptime(),
  });
});

// Register the error handler middleware.
// This MUST come AFTER all routes — it acts as a "catch-all" at the end of the line.
// If any route throws an error that isn't caught by a try/catch, this middleware catches it.
// Think of it like the last defense — the safety net at the bottom of a trapeze.
app.use(errorHandler);

// Start the server and make it listen for incoming HTTP requests on the specified port.
// "app.listen" is what actually starts the server — before this line runs, nothing is happening.
// After it runs, the server sits and waits for requests (like a chef waiting for orders).
app.listen(PORT, () => {
  // Print a message to the console so the developer knows the server is up and running.
  // This is like flipping the "OPEN" sign on a shop door.
  console.log(`Dad Jokes API running on http://localhost:${PORT}`);
  // A fun warning message that adds some dad joke flavor to the startup output.
  console.log(`Warning: Joke density may cause involuntary groaning.`);
});
