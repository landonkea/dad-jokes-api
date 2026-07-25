// Import React and two hooks: useEffect for fetching data on mount, useState for storing it
import React, { useEffect, useState } from "react";
// Import the API function that fetches overall joke statistics
import { fetchStats } from "../hooks/useJokes";

// Define the shape of the stats object so TypeScript knows what fields are available.
// This matches the structure returned by the /api/jokes/stats endpoint.
interface Stats {
  total_jokes: number;    // Total number of jokes in the database
  total_votes: number;    // Total number of votes cast across all jokes
  avg_groan_level: number; // Average groan level rating across all jokes
  most_upvoted: {         // The single most popular joke by upvotes
    setup: string;
    punchline: string;
    upvotes: number;
  } | null;               // null if no jokes have been voted on yet
  category_counts: { category: string; count: number }[];  // Array of how many jokes are in each category
}

// An array of emojis used as decorative icons for each stat card (not currently used in the JSX but available)
const STAT_EMOJIS = ["🃏", "🗳️", "😫", "📂"];

// The StatsPanel component fetches and displays dashboard-style statistics about all the jokes.
export const StatsPanel: React.FC = () => {
  // stats holds the statistics data from the server. null means we haven't fetched it yet.
  const [stats, setStats] = useState<Stats | null>(null);

  // Fetch the stats from the server when the component first mounts.
  // The empty dependency array [] means this runs exactly once.
  useEffect(() => {
    fetchStats()
      .then(setStats)       // On success, store the stats object in state
      .catch(console.error); // On failure, log the error to the browser console
  }, []); // No dependencies: run once on mount

  // If stats haven't loaded yet (still null), show a loading spinner
  if (!stats) {
    return (
      {/* A container for the loading state */}
      <div className="stats-panel">
        {/* A centered loading message with a spinner */}
        <div className="joke-loading">
          {/* The CSS-animated spinning circle */}
          <div className="spinner" />
          {/* A humorous loading message about processing data */}
          <p>Crunching the groan numbers...</p>
        </div>
      </div>
    );
  }

  // Once stats are loaded, render the full dashboard
  return (
    {/* The stats panel container */}
    <div className="stats-panel">
      {/* A heading for the stats section */}
      <h3 className="stats-title">The Groan Analytics</h3>

      {/* A grid of four stat cards showing key numbers */}
      <div className="stats-grid">
        {/* Create an array of stat objects and loop through them to render a card for each */}
        {[
          { value: stats.total_jokes, label: "Total Jokes", emoji: "🃏" },    // Card 1: joke count
          { value: stats.total_votes || 0, label: "Total Votes", emoji: "🗳️" }, // Card 2: vote count (0 if undefined)
          { value: stats.avg_groan_level || 0, label: "Avg Groan", emoji: "😫" }, // Card 3: average groan level
          { value: stats.category_counts.length, label: "Categories", emoji: "📂" }, // Card 4: number of categories
        ].map((s, i) => (
          {/* A single stat card displaying a number, label, and emoji */}
          <div className="stat-card" key={i}>
            {/* The big number — the actual statistic value */}
            <span className="stat-number">{s.value}</span>
            {/* A label explaining what the number represents */}
            <span className="stat-label">{s.label}</span>
            {/* A decorative emoji */}
            <span className="stat-emoji">{s.emoji}</span>
          </div>
        ))}
      </div>

      {/* If there's a most upvoted joke, show it in a special highlighted section */}
      {stats.most_upvoted && (
        {/* A styled container for the "most popular joke" feature */}
        <div className="most-upvoted">
          {/* A heading with a trophy emoji */}
          <h4>🏆 Most Popular Dad Joke</h4>
          {/* The setup line of the most popular joke */}
          <p className="most-upvoted-setup">{stats.most_upvoted.setup}</p>
          {/* The punchline, wrapped in curly quotes (&ldquo; and &rdquo; are left/right double quotes in HTML) */}
          <p className="most-upvoted-punchline">
            &ldquo;{stats.most_upvoted.punchline}&rdquo;
          </p>
          {/* Show how many upvotes it has with a fun message */}
          <span className="most-upvoted-votes">
            👍 {stats.most_upvoted.upvotes} upvotes — the people have spoken
          </span>
        </div>
      )}

      {/* If there are categories, show a horizontal bar chart breakdown */}
      {stats.category_counts.length > 0 && (
        {/* Container for the category breakdown section */}
        <div className="category-breakdown">
          {/* A heading for the chart */}
          <h4>📈 Category Breakdown</h4>
          {/* A container holding all the bar chart rows */}
          <div className="category-bars">
            {/* Loop through each category and render a bar chart row for it */}
            {stats.category_counts.map((cat) => {
              // Find the highest joke count among all categories so we can scale bars proportionally
              const maxCount = Math.max(...stats.category_counts.map((c) => c.count));
              // Calculate the width of this category's bar as a percentage of the max
              // e.g., if max is 20 and this category has 10 jokes, the bar is 50% wide
              const width = (cat.count / maxCount) * 100;
              return (
                {/* A single row in the bar chart: label, bar, and count */}
                <div key={cat.category} className="category-bar-row">
                  {/* The category name, displayed to the left of the bar */}
                  <span className="category-bar-label">{cat.category}</span>
                  {/* The track (grey background) that the colored bar fills */}
                  <div className="category-bar-track">
                    {/* The filled portion of the bar. Its width is set dynamically via inline style. */}
                    <div
                      className="category-bar-fill"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  {/* The exact number of jokes in this category, displayed to the right of the bar */}
                  <span className="category-bar-count">{cat.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
