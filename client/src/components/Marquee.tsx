// Import React so we can use JSX syntax
import React from "react";

// An array of joke objects with setup and punchline pairs.
// These are hardcoded jokes used in the scrolling ticker at the top of the page.
const TICKER_JOKES = [
  { setup: "I'm afraid for the calendar", punchline: "Its days are numbered" },        // A pun about calendars
  { setup: "What do you call a fake noodle?", punchline: "An impasta" },               // A pasta pun
  { setup: "Why don't scientists trust atoms?", punchline: "They make up everything" }, // A science pun
  { setup: "I used to hate facial hair", punchline: "But then it grew on me" },        // "Grew on me" double meaning
  { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear" },      // A visual pun
  { setup: "I'm on a seafood diet", punchline: "I see food and I eat it" },            // A diet pun
  { setup: "Parallel lines have so much in common", punchline: "It's a shame they'll never meet" }, // Math humor
  { setup: "I invented a new word", punchline: "Plagiarism" },                         // Meta humor
  { setup: "I told a chemistry joke", punchline: "There was no reaction" },            // A science pun
  { setup: "My boss told me to have a good day", punchline: "So I went home" },        // Work humor
];

// The Marquee component renders a continuously scrolling horizontal ticker of jokes.
// The jokes scroll from right to left using a CSS animation (defined in global.css).
export const Marquee: React.FC = () => {
  // Duplicate the jokes array by spreading it twice. This creates a seamless loop:
  // when the first set scrolls off the left side, the duplicate is already scrolling in from the right.
  const items = [...TICKER_JOKES, ...TICKER_JOKES];
  return (
    {/* A wrapper div that hides overflow and contains the scrolling track */}
    <div className="marquee-wrap">
      {/* The inner track that moves horizontally via CSS animation. The duplicated items make it seamless. */}
      <div className="marquee-track">
        {/* Loop through all the items (original + duplicate) and render each as a span */}
        {items.map((j, i) => (
          {/* A single joke in the ticker: setup → punchline */}
          <span key={i} className="marquee-item">
            {/* The setup part of the joke, slightly muted */}
            <span className="mq-setup">{j.setup}</span>
            {/* An arrow pointing from setup to punchline */}
            <span className="mq-arrow">→</span>
            {/* The punchline part of the joke, slightly brighter */}
            <span className="mq-punchline">{j.punchline}</span>
          </span>
        ))}
      </div>
    </div>
  );
};
