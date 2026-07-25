// Import React so we can use JSX syntax to write HTML-like code in JavaScript
import React from "react";

// Define the Header component as a React Functional Component.
// It takes no props (empty parentheses) because it only displays static content.
export const Header: React.FC = () => {
  // Return JSX — this is what the component renders to the screen.
  return (
    {/* A <header> HTML element with class "header" for CSS styling (e.g., background color, padding) */}
    <header className="header">
      {/* A wrapper div inside the header that holds the text content and applies centered styling */}
      <div className="header-content">
        {/* The main title of the site, using <h1> for the largest heading size (good for SEO and accessibility) */}
        <h1 className="header-title">
          {/* A laughing emoji before the title for visual flair */}
          <span className="emoji">😂</span>
          {/* The actual title text */}
          {" Dad Jokes API "}
          {/* A laughing emoji after the title for visual flair */}
          <span className="emoji">🤣</span>
        </h1>
        {/* A subtitle line describing the site's purpose in a playful way */}
        <p className="header-subtitle">
          Where every punchline is a groan-worthy masterpiece
        </p>
        {/* A humorous "warning" label that jokes about the side effects of using the site */}
        <p className="header-warning">
          ⚠️ Warning: Prolonged exposure may cause involuntary puns, eye rolls, and
          telling your kids "I'm not funny, you just have low standards"
        </p>
      </div>
    </header>
  );
};
