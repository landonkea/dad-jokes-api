// We need Router from Express — it's a tool that lets us organize routes into separate files.
// Instead of writing all routes in one giant file, we can group related routes together.
// Think of Router like chapters in a book — each one handles a section of the app.
// "Request" and "Response" are types that represent the incoming HTTP request and outgoing response.
import { Router, Request, Response } from "express";

// We import the database connection pool so we can run SQL queries against our database.
// This is the same pool defined in pool.ts — shared across the whole app.
import pool from "../db/pool";

// We import our custom TypeScript types so we can type-check our code.
// "JokeInput" is the shape of data when creating a new joke.
// "ApiResponse" is the standard envelope for all API responses.
// "Joke" is the shape of a single joke from the database.
import { JokeInput, ApiResponse, Joke } from "../types";

// Create a new Router instance. All the routes defined below will be attached to this router.
// Later, in index.ts, we'll attach this router to the path "/api/jokes".
const router = Router();

// ============================================================
// GET / — Get all jokes (with optional filters and sorting)
// ============================================================
// This route handles GET requests to "/api/jokes" (the base path).
// GET means "give me data" — we're not creating or changing anything, just reading.
// The "/" here means the root path of this router.
// "async" lets us use "await" inside to wait for the database query to finish.
router.get("/", async (_req: Request, res: Response): Promise<void> => {
  // "try" wraps code that might fail. If the database query fails, the "catch" block handles it.
  try {
    // Extract query parameters from the URL. For example, if someone visits
    // "/api/jokes?category=puns&sort=groan&limit=5", then:
    //   category = "puns", sort = "groan", limit = "5"
    // Query parameters come after the "?" in a URL and are key=value pairs.
    const { category, sort, limit } = _req.query;

    // Start building a SQL query string. We begin with the simplest possible query:
    // "give me everything from the jokes table."
    let query = "SELECT * FROM jokes";
    // "params" is an array of values that will replace $1, $2, etc. in the query.
    // We start with an empty array because we haven't added any filters yet.
    const params: unknown[] = [];

    // Only filter by category if the user provided one.
    // "typeof category === 'string'" makes sure it's actually a string and not something weird.
    if (category && typeof category === "string") {
      // Add the category value to the params array. It will replace $1 in the query.
      params.push(category);
      // Append a WHERE clause to the query. "$${params.length}" becomes "$1" because
      // params now has 1 item. This is how we safely filter by the user's category.
      // We use $1 instead of inserting the value directly to prevent SQL injection attacks.
      query += ` WHERE category = $${params.length}`;
    }

    // Determine how to sort the results based on the "sort" query parameter.
    // This is a ternary expression — it's a compact if/else written on one line.
    // If sort is "groan", sort by groan level (highest first, "DESC" = descending).
    // If sort is "oldest", sort by creation date (oldest first, "ASC" = ascending).
    // If sort is "controversial", sort by how close upvotes and downvotes are (closest first).
    // If sort is anything else or not provided, default to sorting by most popular (upvotes minus downvotes).
    const sortOption =
      sort === "groan"
        ? "groan_level DESC"
        : sort === "oldest"
        ? "created_at ASC"
        : sort === "controversial"
        ? "ABS(upvotes - downvotes) ASC"
        : "upvotes - downvotes DESC";

    // Append the ORDER BY clause to the query to sort the results.
    // "ORDER BY" tells the database how to arrange the rows it returns.
    query += ` ORDER BY ${sortOption}`;

    // If the user specified a limit (how many results to return), add it to the query.
    if (limit && typeof limit === "string") {
      // "parseInt" converts the string "5" to the number 5.
      // We add it to params so it can safely replace $2 (or $1 if no category was given).
      params.push(parseInt(limit));
      // Add "LIMIT $X" to the SQL query to cap the number of results.
      query += ` LIMIT $${params.length}`;
    }

    // Execute the fully-built SQL query against the database.
    // "pool.query" sends the query and waits for the result.
    // "await" pauses execution until the database responds.
    const result = await pool.query(query, params);

    // Build our standard API response with "success: true" and the joke data.
    // "result.rows" is an array of joke objects returned by the database.
    const response: ApiResponse<Joke[]> = {
      success: true,
      data: result.rows,
    };

    // Send the response back to the client as JSON.
    // By default, this sends HTTP status 200 (OK — everything worked).
    res.json(response);

  // If anything goes wrong (database error, etc.), the "catch" block runs.
  } catch (err) {
    // Build an error response with "success: false" and the error message.
    // "(err as Error)" tells TypeScript to treat "err" as an Error object
    // so we can access ".message" on it.
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };

    // Send the error response with HTTP status 500 (Internal Server Error).
    res.status(500).json(response);
  }
});

// ============================================================
// GET /random — Get one random joke
// ============================================================
// This route handles GET requests to "/api/jokes/random".
// It picks one joke at random from the database — perfect for a "surprise me" button.
router.get("/random", async (_req: Request, res: Response): Promise<void> => {
  try {
    // SQL query: "SELECT * FROM jokes" = get all columns from the jokes table.
    // "ORDER BY RANDOM()" shuffles all the rows randomly.
    // "LIMIT 1" takes only the first (randomly shuffled) row.
    // So we get one random joke.
    const result = await pool.query("SELECT * FROM jokes ORDER BY RANDOM() LIMIT 1");

    // If the result has 0 rows, the database is empty — there are no jokes to return.
    if (result.rows.length === 0) {
      // Send a 404 (Not Found) response with a funny error message.
      // HTTP 404 means "the thing you asked for doesn't exist."
      res.status(404).json({ success: false, error: "No jokes found. The database is as empty as my dad's joke book." });
      // "return" stops execution here so we don't try to access result.rows[0] below
      // (which would be undefined since there are no rows).
      return;
    }

    // Build a successful response. "result.rows[0]" gets the first (and only) joke from the result.
    const response: ApiResponse<Joke> = {
      success: true,
      data: result.rows[0],
    };

    // Send the random joke back to the client.
    res.json(response);
  } catch (err) {
    // If something goes wrong, send a 500 error response.
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };
    res.status(500).json(response);
  }
});

// ============================================================
// GET /categories — Get all categories with joke counts
// ============================================================
// This route handles GET requests to "/api/jokes/categories".
// It returns a list of categories and how many jokes are in each one.
// This is useful for building a filter menu in the frontend.
router.get("/categories", async (_req: Request, res: Response): Promise<void> => {
  try {
    // This SQL query groups jokes by their category and counts how many are in each group.
    // "SELECT category, COUNT(*) as count" = pick the category name and count the rows in each group.
    // "GROUP BY category" = group all rows that have the same category together.
    // "ORDER BY count DESC" = put the category with the most jokes at the top.
    // Example result: [{ category: "classic", count: 8 }, { category: "animals", count: 6 }, ...]
    const result = await pool.query(
      "SELECT category, COUNT(*) as count FROM jokes GROUP BY category ORDER BY count DESC"
    );

    // Build and send a successful response with the category data.
    const response: ApiResponse<{ category: string; count: number }[]> = {
      success: true,
      data: result.rows,
    };
    res.json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };
    res.status(500).json(response);
  }
});

// ============================================================
// GET /stats — Get overall statistics about all jokes
// ============================================================
// This route handles GET requests to "/api/jokes/stats".
// It returns a dashboard-style summary of the entire joke collection.
router.get("/stats", async (_req: Request, res: Response): Promise<void> => {
  try {
    // Run a SQL query that calculates aggregate statistics across ALL jokes.
    // "COUNT(*)" = total number of jokes.
    // "SUM(upvotes + downvotes)" = the total of all votes across all jokes combined.
    // "ROUND(AVG(groan_level), 1)" = the average groan level, rounded to 1 decimal place.
    // This is like asking "give me the big picture stats."
    const stats = await pool.query(`
      SELECT
        COUNT(*) as total_jokes,
        SUM(upvotes + downvotes) as total_votes,
        ROUND(AVG(groan_level), 1) as avg_groan_level
      FROM jokes
    `);

    // Find the single most upvoted joke in the entire database.
    // "ORDER BY upvotes DESC" sorts from most to fewest upvotes.
    // "LIMIT 1" grabs just the top one.
    const mostUpvoted = await pool.query(
      "SELECT * FROM jokes ORDER BY upvotes DESC LIMIT 1"
    );

    // Get the count of jokes per category (same query as the /categories endpoint).
    // This provides category breakdown data as part of the stats.
    const categoryCounts = await pool.query(
      "SELECT category, COUNT(*) as count FROM jokes GROUP BY category ORDER BY count DESC"
    );

    // Build a combined stats object.
    // "...stats.rows[0]" uses the "spread operator" to take all the properties from the first row
    // of the stats query (total_jokes, total_votes, avg_groan_level) and put them into this object.
    // Then we add the most_upvoted joke and the category counts on top.
    const response: ApiResponse<typeof stats.rows[0] & { most_upvoted: Joke | null; category_counts: { category: string; count: number }[] }> = {
      success: true,
      data: {
        // Spread the aggregate stats (total_jokes, total_votes, avg_groan_level).
        ...stats.rows[0],
        // The most upvoted joke, or null if there are no jokes at all.
        // "|| null" handles the case where mostUpvoted.rows[0] is undefined (empty database).
        most_upvoted: mostUpvoted.rows[0] || null,
        // The full list of categories with their counts.
        category_counts: categoryCounts.rows,
      },
    };
    res.json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };
    res.status(500).json(response);
  }
});

// ============================================================
// GET /:id — Get a single joke by its ID number
// ============================================================
// This route handles GET requests to "/api/jokes/42" (or any number).
// The ":id" part is a URL parameter — it captures whatever number is in the URL
// and makes it available as req.params.id.
// Think of it like a form field: the URL is the form, and ":id" is the blank to fill in.
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    // Query the database for a joke where the "id" column matches the number from the URL.
    // "$1" is a placeholder that gets replaced by req.params.id safely.
    const result = await pool.query("SELECT * FROM jokes WHERE id = $1", [
      // req.params.id is whatever was in the URL after "/api/jokes/".
      // For example, if the URL is "/api/jokes/42", then req.params.id is "42".
      req.params.id,
    ]);

    // If no joke was found with that ID, send a 404 (Not Found) response.
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Joke not found. It probably died of cringe." });
      // Stop execution so we don't try to access a non-existent row below.
      return;
    }

    // Send back the found joke wrapped in our standard response format.
    const response: ApiResponse<Joke> = {
      success: true,
      // Get the first (and only) row from the results.
      data: result.rows[0],
    };
    res.json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };
    res.status(500).json(response);
  }
});

// ============================================================
// POST / — Create a new joke
// ============================================================
// This route handles POST requests to "/api/jokes".
// POST means "I'm sending you data to create something new."
// Unlike GET (which just reads data), POST sends data in the request body.
router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the joke data from the request body.
    // When someone sends a POST request, the data they send is in req.body.
    // We destructure it into individual variables using curly braces.
    // "JokeInput" is our TypeScript type that defines what fields a new joke should have.
    const { setup, punchline, category, groan_level, author }: JokeInput = req.body;

    // Validate that the required fields are present.
    // A joke MUST have a setup and a punchline — these are the minimum requirements.
    // If either is missing (empty string is falsy in JavaScript), send a 400 error.
    if (!setup || !punchline) {
      // HTTP 400 means "Bad Request" — the client sent invalid data.
      // It's like filling out a form and forgetting to write your name.
      res.status(400).json({
        success: false,
        error: "Setup and punchline are required. Unlike my dad, who was required to be funny but never delivered.",
      });
      return;
    }

    // Insert the new joke into the database.
    // "$1" through "$5" are placeholders for the values in the array below.
    // "RETURNING *" tells PostgreSQL to send back the newly created row (with its auto-generated id, etc.).
    const result = await pool.query(
      `INSERT INTO jokes (setup, punchline, category, groan_level, author)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        // $1 → the setup text the user provided
        setup,
        // $2 → the punchline text the user provided
        punchline,
        // $3 → the category, or "classic" if the user didn't provide one
        category || "classic",
        // $4 → the groan level, or 5 (middle of the scale) if not provided
        groan_level || 5,
        // $5 → the author name, or "Anonymous Dad" if not provided
        author || "Anonymous Dad",
      ]
    );

    // Build a successful response with the newly created joke.
    const response: ApiResponse<Joke> = {
      success: true,
      // result.rows[0] is the joke that was just inserted, including its auto-generated id.
      data: result.rows[0],
    };

    // Send a 201 (Created) status code.
    // HTTP 201 means "I successfully created the thing you asked for."
    // 201 is more specific than 200 — it tells the client a new resource was born.
    res.status(201).json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };
    res.status(500).json(response);
  }
});

// ============================================================
// POST /vote — Upvote or downvote a joke
// ============================================================
// This route handles POST requests to "/api/jokes/vote".
// The client sends which joke they're voting on and whether it's an upvote or downvote.
// NOTE: This route MUST come after the /:id route in the code, because Express matches
// routes in order. If "/vote" were a parameter, it would be caught by /:id first.
router.post("/vote", async (req: Request, res: Response): Promise<void> => {
  try {
    // Extract the joke_id and vote_type from the request body.
    const { joke_id, vote_type } = req.body;

    // Validate the input.
    // 1. joke_id must be provided (truthy check).
    // 2. vote_type must be exactly "up" or "down" — nothing else.
    // "[...]includes(vote_type)" checks if the array contains the value.
    // If validation fails, send a 400 (Bad Request) error.
    if (!joke_id || !["up", "down"].includes(vote_type)) {
      res.status(400).json({
        success: false,
        error: "joke_id and vote_type ('up' or 'down') are required.",
      });
      return;
    }

    // Record the vote in the votes table.
    // This creates a permanent record of who voted on what (even though we don't track WHO voted).
    // It's like dropping a ballot into a box.
    await pool.query("INSERT INTO votes (joke_id, vote_type) VALUES ($1, $2)", [
      joke_id,
      vote_type,
    ]);

    // Now we need to update the joke's vote count.
    // Determine which column to increment: "upvotes" if it's an upvote, "downvotes" if it's a downvote.
    // "column" will be either the string "upvotes" or "downvotes".
    const column = vote_type === "up" ? "upvotes" : "downvotes";

    // Increment the appropriate vote count by 1.
    // "${column}" inserts the column name directly into the SQL (it's either "upvotes" or "downvotes",
    // both of which are safe — they come from our own code, not user input).
    // "${column} + 1" means "take the current value and add 1."
    // For example: "UPDATE jokes SET upvotes = upvotes + 1 WHERE id = 42"
    await pool.query(`UPDATE jokes SET ${column} = ${column} + 1 WHERE id = $1`, [
      joke_id,
    ]);

    // Fetch the updated joke from the database so we can send it back to the client.
    // This way the client immediately sees the new vote count.
    const jokeResult = await pool.query("SELECT * FROM jokes WHERE id = $1", [
      joke_id,
    ]);

    // If no joke was found with that id (maybe it was deleted between the vote and now),
    // send a 404 error.
    if (jokeResult.rows.length === 0) {
      res.status(404).json({ success: false, error: "Joke not found." });
      return;
    }

    // Send back the updated joke with its new vote count.
    const response: ApiResponse<Joke> = {
      success: true,
      data: jokeResult.rows[0],
    };
    res.json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };
    res.status(500).json(response);
  }
});

// ============================================================
// DELETE /:id — Delete a joke by its ID number
// ============================================================
// This route handles DELETE requests to "/api/jokes/42" (or any number).
// DELETE means "remove this thing from existence."
router.delete("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    // Delete the joke from the database where the id matches.
    // "RETURNING *" sends back the deleted row so we can confirm what was removed.
    // This is useful — the client might want to know what they just deleted.
    const result = await pool.query(
      "DELETE FROM jokes WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    // If result.rows is empty, no joke had that id — nothing was deleted.
    if (result.rows.length === 0) {
      res.status(404).json({ success: false, error: "Joke not found." });
      return;
    }

    // Send back the deleted joke data. The client can use this to update their UI.
    const response: ApiResponse<Joke> = {
      success: true,
      data: result.rows[0],
    };
    res.json(response);
  } catch (err) {
    const response: ApiResponse<null> = {
      success: false,
      error: (err as Error).message,
    };
    res.status(500).json(response);
  }
});

// Export this router so it can be imported and used in index.ts.
// When index.ts says "app.use('/api/jokes', jokesRouter)", it takes all the routes
// defined above and mounts them under "/api/jokes".
// So the GET "/" route above becomes GET "/api/jokes" in the full app.
export default router;
