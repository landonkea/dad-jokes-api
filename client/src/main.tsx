// Import the React library, which lets us write components using JSX syntax
import React from "react";
// Import ReactDOM's createRoot API, which is how React apps attach to an HTML page
import ReactDOM from "react-dom/client";
// Import the main App component that contains all our app's UI
import App from "./App";
// Import our global CSS file so styles are applied to the whole page
import "./styles/global.css";

// Find the HTML element with id="root" in index.html and start the React app inside it
// The "!" tells TypeScript we are certain this element exists (it would be null otherwise)
ReactDOM.createRoot(document.getElementById("root")!).render(
  // React.StrictMode is a development helper that double-checks your code for common mistakes
  <React.StrictMode>
    {/* Render our App component, which is the top-level component of our entire app */}
    <App />
  </React.StrictMode>
);
