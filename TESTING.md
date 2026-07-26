# Testing Guide

## Quick Start

```bash
# Run all client tests
cd client && npm test

# Run all server tests
cd server && npm test

# Run once (no watch mode)
npm run test:run
```

## Test Types

- **Unit Tests**: Test individual functions/components in isolation
- **Integration Tests** (coming soon): Test API endpoints + database together
- **TDD**: Write tests first, then code to pass them
- **BDD**: Tests in plain English Given/When/Then format

## File Locations

- Client tests: `client/src/__tests__/`
- Server tests: `server/src/__tests__/`
