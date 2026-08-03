# =============================================================================
# Dockerfile — Builds a production-ready container image for the Dad Jokes API
# =============================================================================
# WHAT: This file tells Docker how to package our entire app (server + client)
#       into a lightweight, portable "container" that can run anywhere.
# WHY:  Containers ensure the app runs the same on your laptop, a coworker's
#       machine, and in production — no "it works on my machine" problems.
# HOW:  We use a "multi-stage build" — install deps, build the client, then
#       copy only what's needed into a slim final image. This keeps it small.
# =============================================================================

# ---------------------------------------------------------------------------
# STAGE 1: "server-build" — Compile the TypeScript server into JavaScript
# ---------------------------------------------------------------------------
# "FROM node:20-alpine" pulls the official Node.js 20 image built on Alpine
# Linux (a tiny ~5MB Linux distro). This gives us Node.js and npm to run our
# app. Alpine is chosen because it's much smaller than the full Debian-based
# Node image, which means a smaller, faster-to-download container.
# "AS server-build" gives this stage a nickname so we can reference it later.
# This stage needs devDependencies (like "typescript") to run the compiler,
# so we install ALL dependencies here — but this whole stage is discarded
# later, and only the compiled output (server/dist) is copied into the
# final production image. That keeps devDependencies out of the shipped image.
FROM node:20-alpine AS server-build

# "WORKDIR /app" sets the working directory inside the container to /app.
# All subsequent COPY and RUN commands will execute from this folder.
# It's like "cd /app" but persistent for all future instructions.
WORKDIR /app

# Copy just the server's package manifest first so Docker can cache the
# "npm ci" layer — if dependencies haven't changed, rebuilds skip reinstalling.
COPY server/package*.json ./server/

# Install ALL server dependencies, including devDependencies like
# "typescript", since we need "tsc" to compile the source below.
RUN cd server && npm ci

# Copy the rest of the server source code into the container.
COPY server/ ./server/

# Compile TypeScript to JavaScript. This runs "tsc" (see server/package.json's
# "build" script), which reads server/src/**/*.ts and writes the compiled
# output to server/dist/. Without this step, server/dist/index.js never
# exists and the container crashes on startup.
RUN cd server && npm run build

# "FROM node:20-alpine AS client-build" starts a fresh, separate stage for
# building the frontend. It doesn't inherit anything from "server-build" —
# each stage starts clean from the base image, which keeps stages isolated
# and cacheable independently.
FROM node:20-alpine AS client-build

WORKDIR /app

# Same trick as above — copy the client's package manifest first for caching.
COPY client/package*.json ./client/

# Install ALL client dependencies (including devDependencies like vite and
# typescript) because we need them to BUILD the client, even though we won't
# ship them in the final image.
RUN cd client && npm ci

# Copy the rest of the client source code into the container.
COPY client/ ./client/

# Build the client for production. This runs "tsc && vite build" which:
# 1. Compiles TypeScript to JavaScript
# 2. Bundles and minifies everything into a static dist/ folder
# The resulting static files can be served by the Express server.
RUN cd client && npm run build

# ---------------------------------------------------------------------------
# STAGE 3: "production" — Assemble the final, lean runtime image
# ---------------------------------------------------------------------------
# This is the image that actually ships and runs in production. It starts
# fresh from the small Alpine base — none of the devDependencies or source
# files from the build stages above are present here unless we explicitly
# COPY them in. This is what keeps the final image small.
FROM node:20-alpine AS production

WORKDIR /app

# Copy just the server's package manifest first so Docker can cache the
# "npm ci --only=production" layer.
COPY server/package*.json ./server/

# Install ONLY the production dependencies (not devDependencies like
# typescript or vitest). "npm ci" is stricter than "npm install" — it uses
# the exact lockfile versions and fails if anything is out of sync, ensuring
# reproducible builds.
RUN cd server && npm ci --only=production

# Copy the COMPILED server output (server/dist) from the "server-build"
# stage — not the TypeScript source. This is the key fix: previously nothing
# ever ran "npm run build," so server/dist/index.js never existed and the
# container crashed on startup. Now we copy the already-compiled JavaScript.
COPY --from=server-build /app/server/dist ./server/dist

# Copy the built static frontend assets from the "client-build" stage so
# they ship in the final image alongside the compiled server.
COPY --from=client-build /app/client/dist ./client/dist

# Copy the startup script that initializes the database schema (and seeds sample
# data on a first run against an empty database) before starting the server.
COPY docker-entrypoint.sh ./docker-entrypoint.sh
RUN chmod +x ./docker-entrypoint.sh

# ---------------------------------------------------------------------------
# Expose the port and define the startup command
# ---------------------------------------------------------------------------
# "EXPOSE 3001" documents that the container listens on port 3001.
# This is mainly for documentation — it doesn't actually publish the port.
# We still need to map it with -p in docker run or docker-compose.
EXPOSE 3001

# "CMD" is the command Docker runs when the container starts. We use the shell form
# via docker-entrypoint.sh (see that file) so the database schema exists — and, on a
# fresh/empty database, gets sample data — before the Express server starts accepting
# requests. Without this, every route that touches Postgres 500s on a brand-new
# database (the "jokes"/"votes" tables never get created).
CMD ["./docker-entrypoint.sh"]
