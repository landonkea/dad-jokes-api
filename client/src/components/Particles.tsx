// Import React and two hooks: useEffect for running side effects, useState for storing data
import React, { useEffect, useState } from "react";

// An array of emojis that will be randomly selected for the floating background particles.
// These add visual interest and humor to the page.
const EMOJIS = ["😂", "🤣", "💀", "😅", "🙄", "😬", "👨‍👧‍👦", "🫠", "🥱", "😪", "😤", "🥴"];

// A helper function that generates an array of particle configuration objects.
// Each particle has random properties so they look organic and varied.
// "count" is how many particles to create.
function makeParticles(count: number) {
  // Array.from creates a new array with "count" elements. The callback assigns each particle's properties.
  return Array.from({ length: count }, (_, i) => ({
    id: i,                                              // A unique number to use as a React key
    emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)], // A random emoji from the list
    left: Math.random() * 100,                          // Random horizontal position (0-100% of the screen width)
    duration: 12 + Math.random() * 18,                  // How long one float cycle takes (12-30 seconds). Longer = slower.
    delay: Math.random() * 15,                          // How many seconds to wait before this particle starts moving (0-15s)
    size: 0.8 + Math.random() * 1,                      // Random font size between 0.8rem and 1.8rem
  }));
}

// The Particles component renders floating emoji particles across the entire background of the page.
// They use CSS animations (defined in global.css) to float upward continuously.
export const Particles: React.FC = () => {
  // Generate 18 particles on mount. useState's callback form (passing a function) ensures makeParticles
  // only runs once, not on every render. The particles never change after creation.
  const [particles] = useState(() => makeParticles(18));

  return (
    {/* A fixed/absolute positioned container that covers the whole page and holds all particles */}
    <div className="particles-container">
      {/* Loop through each particle and render a floating emoji span */}
      {particles.map((p) => (
        {/* A <span> for each particle. The CSS class "particle" applies the floating animation. */}
        <span
          {/* Unique key so React can efficiently track and update each particle */}
          key={p.id}
          className="particle"
          {/* Inline styles set each particle's unique random properties */}
          style={{
            left: `${p.left}%`,                   // Horizontal starting position
            animationDuration: `${p.duration}s`,  // How fast this particle floats (longer = slower)
            animationDelay: `${p.delay}s`,        // Stagger the start times so they don't all move together
            fontSize: `${p.size}rem`,              // Random size for visual variety
          }}
        >
          {/* The actual emoji character that will be displayed and animated */}
          {p.emoji}
        </span>
      ))}
    </div>
  );
};
