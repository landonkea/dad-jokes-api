// The actual CREATE TABLE / CREATE INDEX statements for the app's schema, pulled out of
// db/init.ts so integration tests can stand up the same schema against a test database
// without duplicating this SQL (and risking the two copies drifting apart).
export const SCHEMA_SQL = `
  -- This creates the "jokes" table where all our dad jokes will be stored.
  CREATE TABLE IF NOT EXISTS jokes (
    id SERIAL PRIMARY KEY,
    setup TEXT NOT NULL,
    punchline TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'classic',
    groan_level INTEGER DEFAULT 5 CHECK (groan_level >= 1 AND groan_level <= 10),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    author VARCHAR(100) DEFAULT 'Anonymous Dad',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  -- This creates the "votes" table to track individual upvotes and downvotes.
  CREATE TABLE IF NOT EXISTS votes (
    id SERIAL PRIMARY KEY,
    joke_id INTEGER REFERENCES jokes(id) ON DELETE CASCADE,
    vote_type VARCHAR(4) NOT NULL CHECK (vote_type IN ('up', 'down')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  ALTER TABLE votes ADD COLUMN IF NOT EXISTS voter_ip VARCHAR(45);

  CREATE INDEX IF NOT EXISTS idx_jokes_category ON jokes(category);
  CREATE INDEX IF NOT EXISTS idx_jokes_groan_level ON jokes(groan_level);
  CREATE INDEX IF NOT EXISTS idx_votes_joke_id ON votes(joke_id);
  CREATE INDEX IF NOT EXISTS idx_votes_joke_ip ON votes(joke_id, voter_ip);
  CREATE INDEX IF NOT EXISTS idx_jokes_score ON jokes ((upvotes - downvotes));
`;
