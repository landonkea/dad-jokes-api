// Import React and two hook functions we need: useState for storing data, useCallback for memoizing functions
import React, { useState, useCallback } from "react";
// Import the Header component that shows the site title and branding at the top
import { Header } from "./components/Header";
// Import the JokeCard component that shows a single random joke with voting
import { JokeCard } from "./components/JokeCard";
// Import the JokeList component that shows a scrollable list of multiple jokes
import { JokeList } from "./components/JokeList";
// Import the CategoryPicker component that lets users filter jokes by category
import { CategoryPicker } from "./components/CategoryPicker";
// Import the JokeSubmitter component that contains the form for adding new jokes
import { JokeSubmitter } from "./components/JokeSubmitter";
// Import the StatsPanel component that shows statistics about all the jokes
import { StatsPanel } from "./components/StatsPanel";
// Import the Particles component that renders floating emoji decorations in the background
import { Particles } from "./components/Particles";
// Import the Marquee component that shows a scrolling ticker of joke setup → punchline pairs
import { Marquee } from "./components/Marquee";

// Define a TypeScript type that can only be one of these four tab names — prevents typos and gives autocomplete
type Tab = "random" | "browse" | "submit" | "stats";

// Create an object that maps each tab name to a funny tagline shown below the nav bar
// Record<Tab, string> means "an object where every key is a Tab and every value is a string"
const TAB_TAGLINES: Record<Tab, string> = {
  random: "Roll the dice of dad humor",
  browse: "The entire encyclopedia of groans",
  submit: "Unleash your inner father figure",
  stats: "How many people have suffered?",
};

// Define the App component as a React Functional Component (React.FC)
const App: React.FC = () => {
  // activeTab stores which tab is currently selected. "random" is the default.
  const [activeTab, setActiveTab] = useState<Tab>("random");
  // selectedCategory stores which category filter is active. undefined means "show all".
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  // sortBy stores which sort option is selected. undefined means default sorting.
  const [sortBy, setSortBy] = useState<string | undefined>();
  // listKey is a counter we increment to force JokeList to remount and re-fetch data.
  const [listKey, setListKey] = useState(0);

  // useCallback memoizes this function so it doesn't get recreated on every render.
  // Called after a joke is submitted successfully to refresh the list.
  const handleJokeSubmitted = useCallback(() => {
    // Increment listKey by 1. React sees the new key and destroys + recreates JokeList.
    setListKey((prev) => prev + 1);
  }, []); // Empty dependency array means this function is created once and never changes

  // Define an array of tab configuration objects, each with an id, display label, and emoji.
  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "random", label: "Random Joke", emoji: "🎲" },
    { id: "browse", label: "Browse Jokes", emoji: "📚" },
    { id: "submit", label: "Submit Joke", emoji: "✍️" },
    { id: "stats", label: "Stats", emoji: "📊" },
  ];

  // Return the JSX that makes up the entire page
  return (
    <div className="app">
      {/* Render floating emoji particles in the background for visual flair */}
      <Particles />
      {/* Render the site header with the title "Dad Jokes API" */}
      <Header />
      {/* Render the scrolling ticker of joke setup→punchline pairs */}
      <Marquee />

      {/* The navigation bar that holds all the tab buttons */}
      <nav className="tab-nav">
        {/* Loop through each tab config and create a button for it */}
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-emoji">{tab.emoji}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* A paragraph showing a funny tagline that changes depending on which tab is active */}
      <p style={{
        textAlign: "center",
        color: "var(--text-muted)",
        fontSize: "0.85rem",
        fontStyle: "italic",
        marginTop: "-20px",
        marginBottom: "28px",
      }}>
        {TAB_TAGLINES[activeTab]}
      </p>

      {/* The main content area where different tab views are conditionally rendered */}
      <main className="main-content">
        {/* Only render JokeCard (random joke view) if the "random" tab is active */}
        {activeTab === "random" && <JokeCard />}

        {/* Only render the browse section if the "browse" tab is active */}
        {activeTab === "browse" && (
          <div className="browse-section">
            {/* Category filter buttons — pass current selection and setter to update it */}
            <CategoryPicker
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
            {/* A row of controls for sorting the joke list */}
            <div className="sort-controls">
              <label>Sort by: </label>
              {/* Dropdown for choosing how to sort jokes */}
              <select
                value={sortBy || ""}
                onChange={(e) => setSortBy(e.target.value || undefined)}
              >
                <option value="">Top Voted</option>
                <option value="groan">Most Groans</option>
                <option value="oldest">Oldest First</option>
                <option value="controversial">Most Controversial</option>
              </select>
            </div>
            {/* The list of jokes. Key forces React to remount when any filter changes. */}
            <JokeList
              key={`${selectedCategory}-${sortBy}-${listKey}`}
              category={selectedCategory}
              sort={sortBy}
            />
          </div>
        )}

        {/* Only render the joke submission form if the "submit" tab is active */}
        {activeTab === "submit" && (
          <JokeSubmitter onJokeSubmitted={handleJokeSubmitted} />
        )}

        {/* Only render the stats dashboard if the "stats" tab is active */}
        {activeTab === "stats" && <StatsPanel />}
      </main>

      {/* The footer at the bottom of the page */}
      <footer className="footer">
        <p>
          Built with 💀 and an unhealthy obsession with puns | Dad Jokes API v1.0
        </p>
        <p className="footer-sub">
          No dads were harmed in the making of this website. Their pride, however,
          is a different story. Side effects include: snorting, crying, and
          involuntary "ba dum tss" sounds.
        </p>
      </footer>
    </div>
  );
};

// Export the App component as the default export so main.tsx can import it
export default App;
