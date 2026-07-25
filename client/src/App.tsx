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
  random: "Roll the dice of dad humor",       // Tagline for the random joke tab
  browse: "The entire encyclopedia of groans", // Tagline for the browse jokes tab
  submit: "Unleash your inner father figure",  // Tagline for the submit joke tab
  stats: "How many people have suffered?",      // Tagline for the stats tab
};

// Define the App component as a React Functional Component (React.FC)
const App: React.FC = () => {
  // activeTab stores which tab is currently selected. "random" is the default so the app opens on the random joke view.
  const [activeTab, setActiveTab] = useState<Tab>("random");
  // selectedCategory stores which category filter is active in the browse tab. undefined means "show all".
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  // sortBy stores which sort option is selected in the browse tab (e.g., "groan", "oldest"). undefined means default sorting.
  const [sortBy, setSortBy] = useState<string | undefined>();
  // listKey is a counter we increment to force the JokeList component to completely remount (restart) when a joke is submitted.
  // React reuses components by default, so changing this key forces it to re-fetch data from scratch.
  const [listKey, setListKey] = useState(0);

  // useCallback memoizes this function so it doesn't get recreated on every render,
  // which prevents unnecessary re-renders of child components that receive it as a prop.
  // This function is called after a joke is submitted successfully.
  const handleJokeSubmitted = useCallback(() => {
    // Increment listKey by 1. React sees the new key and destroys + recreates the JokeList, forcing a fresh fetch.
    setListKey((prev) => prev + 1);
  }, []); // Empty dependency array means this function is created once and never changes

  // Define an array of tab configuration objects, each with an id, display label, and an emoji icon.
  // This is easier to maintain than writing each tab button manually.
  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "random", label: "Random Joke", emoji: "🎲" },  // Tab 1: shows a random joke
    { id: "browse", label: "Browse Jokes", emoji: "📚" },  // Tab 2: browse and filter jokes
    { id: "submit", label: "Submit Joke", emoji: "✍️" },   // Tab 3: submit a new joke
    { id: "stats", label: "Stats", emoji: "📊" },           // Tab 4: view statistics
  ];

  // Return the JSX that makes up the entire page
  return (
    {/* The outer wrapper div with class "app" for overall page styling */}
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
          {/* A clickable button for switching between tabs */}
          <button
            {/* React needs a unique key for each item in a list so it can track changes efficiently */}
            key={tab.id}
            {/* Apply the "active" CSS class only to the currently selected tab, giving it a highlighted look */}
            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
            {/* When this button is clicked, set this tab as the active one */}
            onClick={() => setActiveTab(tab.id)}
          >
            {/* Show the emoji icon next to the tab label */}
            <span className="tab-emoji">{tab.emoji}</span>
            {/* Show the text label for this tab */}
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* A paragraph showing a funny tagline that changes depending on which tab is active */}
      <p style={{
        textAlign: "center",           // Center the text horizontally
        color: "var(--text-muted)",     // Use a muted/grey color from our CSS variables
        fontSize: "0.85rem",            // Make the text slightly smaller than normal
        fontStyle: "italic",            // Make the text italic for a playful feel
        marginTop: "-20px",             // Pull it up closer to the nav bar above
        marginBottom: "28px",           // Add space below before the main content
      }}>
        {/* Look up and display the tagline for the current active tab */}
        {TAB_TAGLINES[activeTab]}
      </p>

      {/* The main content area where different tab views are conditionally rendered */}
      <main className="main-content">
        {/* Only render the JokeCard (random joke view) if the "random" tab is active */}
        {activeTab === "random" && <JokeCard />}

        {/* Only render the browse section if the "browse" tab is active */}
        {activeTab === "browse" && (
          {/* A wrapper div for the browse section's layout */}
          <div className="browse-section">
            {/* The category filter buttons — pass the current selection and a setter to update it */}
            <CategoryPicker
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
            {/* A row of controls for sorting the joke list */}
            <div className="sort-controls">
              {/* A label next to the dropdown explaining what it controls */}
              <label>Sort by: </label>
              {/* A dropdown menu for choosing how to sort the jokes */}
              <select
                {/* The currently selected sort option. If sortBy is undefined, show empty string (the default option). */}
                value={sortBy || ""}
                {/* When the user picks a new sort option, update sortBy state. Empty string becomes undefined to reset. */}
                onChange={(e) => setSortBy(e.target.value || undefined)}
              >
                {/* Default option: jokes sorted by top voted */}
                <option value="">Top Voted</option>
                {/* Sort by jokes with the most groans */}
                <option value="groan">Most Groans</option>
                {/* Sort by oldest jokes first */}
                <option value="oldest">Oldest First</option>
                {/* Sort by most controversial (closest upvote/downvote ratio) */}
                <option value="controversial">Most Controversial</option>
              </select>
            </div>
            {/* The list of jokes. The key prop combines all filter values so React recreates the list when any filter changes. */}
            <JokeList
              {/* Key forces React to remount JokeList whenever category, sort, or listKey changes */}
              key={`${selectedCategory}-${sortBy}-${listKey}`}
              {/* Pass the selected category filter down to the JokeList */}
              category={selectedCategory}
              {/* Pass the selected sort option down to the JokeList */}
              sort={sortBy}
            />
          </div>
        )}

        {/* Only render the joke submission form if the "submit" tab is active */}
        {activeTab === "submit" && (
          {/* Pass the callback so the form can tell App to refresh the joke list after a submission */}
          <JokeSubmitter onJokeSubmitted={handleJokeSubmitted} />
        )}

        {/* Only render the stats dashboard if the "stats" tab is active */}
        {activeTab === "stats" && <StatsPanel />}
      </main>

      {/* The footer at the bottom of the page with a funny disclaimer */}
      <footer className="footer">
        {/* Main footer line crediting the build and naming the API version */}
        <p>
          Built with 💀 and an unhealthy obsession with puns | Dad Jokes API v1.0
        </p>
        {/* A smaller humorous disclaimer about the "side effects" of using the site */}
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
