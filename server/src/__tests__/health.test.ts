import { describe, it, expect } from 'vitest';

describe('Health check', () => {
  it('should return true for a basic math check', () => {
    expect(1 + 1).toBe(2);
  });

  it('should verify joke data structure matches expected shape', () => {
    const joke = {
      id: 1,
      setup: 'Test setup',
      punchline: 'Test punchline',
      category: 'classic',
      groan_level: 5,
      upvotes: 0,
      downvotes: 0,
      author: 'Test Dad',
      created_at: new Date(),
    };
    expect(joke).toHaveProperty('id');
    expect(joke).toHaveProperty('setup');
    expect(joke).toHaveProperty('punchline');
    expect(joke.groan_level).toBeGreaterThanOrEqual(1);
    expect(joke.groan_level).toBeLessThanOrEqual(10);
  });
});
