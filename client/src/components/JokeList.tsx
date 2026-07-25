// Import React and two hooks: useEffect for running side effects (like fetching data), useState for storing data
import React, { useEffect, useState } from "react";
// Import the API functions for fetching jokes and voting, plus the Joke type for TypeScript
import { fetchJokes, voteJoke, Joke } from "../hooks/useJokes";

// Define the props (inputs) that JokeList accepts. Both are optional filters.
interface JokeListProps {
  category?: string;  // Optional category filter — if set, only show jokes in this category
  sort?: string;      // Optional sort order — if set, sort jokes by this criteria
}

// The JokeList component displays a scrollable list of jokes that can be filtered and sorted.
export const JokeList: React.FC<JokeListProps> = ({ category, sort }) => {
  // jokes stores the array of joke objects fetched from the server. Starts empty.
  const [jokes, setJokes] = useState<Joke[]>([]);
  // loading is true while the initial fetch is in progress, so we can show a spinner.
  const [loading, setLoading] = useState(true);
  // error stores a message if something goes wrong with the fetch, or null if everything is fine.
  const [error, setError] = useState<string | null>(null);
  // expandedId tracks which joke's punchline is currently expanded (visible). null means none are expanded.
  // This creates an accordion-style UI where you click to reveal/hide punchlines.
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // useEffect runs every time the category or sort prop changes.
  // It fetches a new list of jokes from the server matching the current filters.
  useEffect(() => {
    // "cancelled" is a flag to prevent updating state if the component unmounts or the effect re-runs
    // before the fetch completes. Without this, you'd get a "can't update unmounted component" warning.
    let cancelled = false;
    // Show the loading spinner while the fetch is in progress
    setLoading(true);
    // Send the fetch request with the current category, sort, and a limit of 20 jokes
    fetchJokes({ category, sort, limit: 20 })
      .then((data) => {
        // Only update state if this effect hasn't been cancelled (component still mounted)
        if (!cancelled) {
          setJokes(data);       // Store the fetched jokes
          setLoading(false);    // Hide the loading spinner
        }
      })
      .catch((err) => {
        // Only update state if not cancelled
        if (!cancelled) {
          setError(err.message); // Store the error message to display to the user
          setLoading(false);     // Hide the loading spinner
        }
      });
    // The cleanup function runs before the effect re-runs or when the component unmounts.
    // Setting cancelled = true prevents the .then/.catch from updating state on an old fetch.
    return () => {
      cancelled = true;
    };
  }, [category, sort]); // Re-run this effect whenever category or sort changes

  // Handle when a user clicks the upvote or downvote button on a joke in the list.
  const handleVote = async (jokeId: number, voteType: "up" | "down") => {
    try {
      // Send the vote to the server. The server returns the updated joke with new vote counts.
      const updated = await voteJoke(jokeId, voteType);
      // Replace the old joke with the updated one in our local state.
      // .map() loops through all jokes, and for the matching ID, swaps in the updated version.
      setJokes((prev) => prev.map((j) => (j.id === jokeId ? updated : j)));
    } catch (err) {
      // If the vote fails, log the error to the console for debugging (the list stays unchanged)
      console.error("Vote failed:", err);
    }
  };

  // If we're still loading jokes, show a loading state instead of the list
  if (loading)
    return (
      {/* A centered loading container with a spinner */}
      <div className="joke-list-loading">
        {/* The CSS-animated spinning circle */}
        <div className="spinner" />
        {/* A funny loading message */}
        <p>Flipping through the dad joke binder...</p>
      </div>
    );

  // If an error occurred, show the error message instead of the list
  if (error)
    return (
      {/* Error display with a red/sad styling class */}
      <div className="joke-list-error">
        {/* Show the error message with a frustrated emoji */}
        <p>😫 {error}</p>
        {/* A humorous secondary message */}
        <p style={{ fontSize: "0.85rem", marginTop: "8px" }}>
          Even the joke list is having a bad day.
        </p>
      </div>
    );

  // Main rendering: the list of jokes (or an empty state message)
  return (
    {/* Container for the list of joke items */}
    <div className="joke-list">
      {/* If the array is empty (no jokes match the filters), show a message */}
      {jokes.length === 0 && (
        <p className="joke-list-empty">
          No jokes found. Even the database is speechless. 🤐
        </p>
      )}
      {/* Loop through each joke and render a list item for it */}
      {jokes.map((joke) => (
        {/* A single joke item in the list. key={joke.id} helps React track which items change. */}
        <div key={joke.id} className="joke-list-item">
          {/* The clickable header that shows the setup and an expand/collapse arrow */}
          {/* Clicking toggles between expanding and collapsing the punchline details */}
          <div className="joke-list-item-header" onClick={() => setExpandedId(expandedId === joke.id ? null : joke.id)}>
            {/* Show the joke's setup text as a preview */}
            <span className="joke-list-setup">{joke.setup}</span>
            {/* Show a right-pointing arrow if collapsed, or a down-pointing arrow if expanded */}
            <span className="joke-list-expand">{expandedId === joke.id ? "▼" : "▶"}</span>
          </div>
          {/* Only render the expanded details if this joke's ID matches expandedId */}
          {expandedId === joke.id && (
            {/* The body section with the punchline and metadata, only visible when expanded */}
            <div className="joke-list-item-body">
              {/* Show the punchline with a speech bubble emoji */}
              <p className="joke-list-punchline">💬 {joke.punchline}</p>
              {/* A row of metadata: category, groan level, votes, and author */}
              <div className="joke-list-meta">
                {/* Show which category this joke belongs to */}
                <span className="joke-list-category">{joke.category}</span>
                {/* Show the groan level rating */}
                <span className="joke-list-groan">Groan: {joke.groan_level}/10</span>
                {/* Small upvote and downvote buttons for voting directly in the list */}
                <div className="joke-list-votes">
                  {/* Small upvote button — sends an upvote to the server */}
                  <button className="vote-btn-sm" onClick={() => handleVote(joke.id, "up")}>
                    👍 {joke.upvotes}
                  </button>
                  {/* Small downvote button — sends a downvote to the server */}
                  <button className="vote-btn-sm" onClick={() => handleVote(joke.id, "down")}>
                    👎 {joke.downvotes}
                  </button>
                </div>
                {/* Show who wrote the joke */}
                <span className="joke-list-author">— {joke.author}</span>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
