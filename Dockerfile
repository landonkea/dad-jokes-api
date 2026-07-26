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
# STAGE 1: "base" — Set up a lightweight Node.js environment
# ---------------------------------------------------------------------------
# "FROM node:20-alpine" pulls the official Node.js 20 image built on Alpine
# Linux (a tiny ~5MB Linux distro). This gives us Node.js and npm to run our
# app. Alpine is chosen because it's much smaller than the full Debian-based
# Node image, which means a smaller, faster-to-download container.
# "AS base" gives this stage a nickname so we can reference it later.
FROM node:20-alpine AS base

# "WORKDIR /app" sets the working directory inside the container to /app.
# All subsequent COPY and RUN commands will execute from this folder.
# It's like "cd /app" but persistent for all future instructions.
WORKDIR /app

# ---------------------------------------------------------------------------
# STAGE 2: Install server production dependencies
# ---------------------------------------------------------------------------
# "COPY server/package*.json ./server/" copies ONLY the server's package.json
# and package-lock.json into the container FIRST. The wildcard (*) catches
# both files. We copy just the manifest files before copying source code so
# Docker can cache this layer — if dependencies haven't changed, Docker
# skips reinstalling them on rebuilds (a huge time saver!).
COPY server/package*.json ./server/

# "RUN cd server && npm ci --only=production" installs ONLY the production
# dependencies (not devDependencies like typescript or vitest). "npm ci" is
# stricter than "npm install" — it uses the exact lockfile versions and fails
# if anything is out of sync, ensuring reproducible builds.
RUN cd server && npm ci --only=production

# ---------------------------------------------------------------------------
# STAGE 3: Install client dependencies and build the frontend
# ---------------------------------------------------------------------------
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
# STAGE 4: Copy server source code into the final image
# ---------------------------------------------------------------------------
# Now we copy the server source code. We do this AFTER installing dependencies
# so that small code changes don't force a full dependency reinstall.
COPY server/ ./server/

# ---------------------------------------------------------------------------
# Expose the port and define the startup command
# ---------------------------------------------------------------------------
# "EXPOSE 3001" documents that the container listens on port 3001.
# This is mainly for documentation — it doesn't actually publish the port.
# We still need to map it with -p in docker run or docker-compose.
EXPOSE 3001

# "CMD" is the command Docker runs when the container starts.
# We use the exec form (JSON array) for better signal handling.
# This starts our Express server by running the compiled JavaScript.
CMD ["node", "server/dist/index.js"]
