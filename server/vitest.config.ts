// Import the Vitest configuration helper to define our test settings.
import { defineConfig } from 'vitest/config';

// Export the Vitest configuration so the test runner knows how to behave.
export default defineConfig({
  test: {
    // Enable global test functions (describe, it, expect) without needing to import them.
    // This matches Jest's behavior and keeps test files cleaner.
    globals: true,
  },
});
