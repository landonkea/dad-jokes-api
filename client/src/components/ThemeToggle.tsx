import React from "react";
import { useTheme } from "../hooks/useTheme";

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      style={{
        position: "fixed",
        top: "16px",
        right: "16px",
        zIndex: 100,
        background: "rgba(255,255,255,0.1)",
        border: "2px solid rgba(255,255,255,0.15)",
        color: "var(--text-primary)",
        padding: "10px 14px",
        borderRadius: "12px",
        cursor: "pointer",
        fontSize: "1.2rem",
        backdropFilter: "blur(8px)",
        transition: "all 0.3s",
      }}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
};
