// Import React so we can use JSX syntax
import React from "react";
// Import our custom useTheme hook which manages the dark/light theme state
import { useTheme } from "../hooks/useTheme";

// The ThemeToggle component renders a floating button that switches between dark and light mode
export const ThemeToggle: React.FC = () => {
  // Get the current theme and the toggle function from our custom hook
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}                    // Call toggleTheme when the button is clicked
      style={{
        position: "fixed",                     // Fixed position so it stays in the corner when scrolling
        top: "16px",                           // 16 pixels from the top of the viewport
        right: "16px",                         // 16 pixels from the right edge of the viewport
        zIndex: 100,                           // High z-index so it floats above other elements
        background: "rgba(255,255,255,0.1)",   // Semi-transparent white background
        border: "2px solid rgba(255,255,255,0.15)", // Subtle semi-transparent border
        color: "var(--text-primary)",          // Uses CSS variable for text color (adapts to theme)
        padding: "10px 14px",                  // Inner spacing: 10px top/bottom, 14px left/right
        borderRadius: "12px",                  // Rounded corners for a modern look
        cursor: "pointer",                     // Show the hand cursor on hover to indicate it's clickable
        fontSize: "1.2rem",                    // Slightly larger font size for the emoji icon
        backdropFilter: "blur(8px)",           // Blurs the background behind the button (glass effect)
        transition: "all 0.3s",               // Smooth animation when the theme changes (0.3 seconds)
      }}
      // Tooltip text changes based on current theme: "Switch to light mode" or "Switch to dark mode"
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {/* Show a sun emoji in dark mode (to switch to light), moon emoji in light mode (to switch to dark) */}
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
};
