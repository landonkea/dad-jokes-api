// =============================================================================
// Vite Configuration File
// =============================================================================
// This file tells Vite (our frontend build tool) how to behave.
// Vite is what powers our React app's development server and production builds.
// Think of this as the "settings panel" for our frontend tooling.
// =============================================================================

// import { defineConfig } from "vite";
// ^ This imports a helper function from Vite. defineConfig gives us
//   auto-complete/IntelliSense in our editor so we know what options exist.
import { defineConfig } from "vite";

// import react from "@vitejs/plugin-react";
// ^ This imports the React plugin. Without this, Vite wouldn't know how to
//   handle JSX (the HTML-like syntax used in React components like <div>).
//   This plugin also enables Fast Refresh, so when you save a file, the
//   browser updates instantly without losing your component's state.
import react from "@vitejs/plugin-react";

// export default defineConfig({ ... });
// ^ We export a configuration object. "export default" means this is the
//   main thing this file gives to other files. Vite reads this file
//   automatically when it starts up.
export default defineConfig({

  // plugins: [react()];
  // ^ This tells Vite to use the React plugin we imported above.
  //   Without this line, React's JSX syntax wouldn't work at all.
  plugins: [react()],

  // server: { ... }
  // ^ This section configures Vite's LOCAL development server.
  //   This is the server that runs on YOUR computer while you code.
  //   It does NOT affect the production/deployed version.
  server: {

    // port: 5173;
    // ^ This sets which port (door number) the dev server runs on.
    //   When you start the app, you'll visit http://localhost:5173 in your browser.
    //   5173 is Vite's default port. You could change this if 5173 is already in use.
    port: 5173,

    // proxy: { ... }
    // ^ THIS IS REALLY IMPORTANT. Here's why it exists:
    //
    //   Our React app runs on port 5173.
    //   Our Express API server runs on port 3001.
    //   Browsers block requests to different ports for security reasons
    //   (this is called CORS - Cross-Origin Resource Sharing).
    //
    //   The proxy acts as a MIDDLEMAN. When our React app asks for
    //   something like "/api/jokes", instead of the browser blocking it,
    //   Vite's proxy quietly forwards the request to localhost:3001 for us.
    //
    //   Without this proxy, we'd see nasty CORS errors in the browser.
    proxy: {

      // "/api": { ... }
      // ^ This says: "any URL that STARTS with /api, forward it."
      //   So if our React app fetches "/api/jokes", the proxy intercepts it.
      "/api": {

        // target: "http://localhost:3001";
        // ^ Where should the proxy send the request? To our Express server
        //   running on port 3001 on our own computer.
        target: "http://localhost:3001",

        // changeOrigin: true;
        // ^ This changes the "Origin" header of the request to match the
        //   target server. Without this, the Express server might reject
        //   the request because it looks like it came from a different domain.
        //   Think of it like changing the return address on a letter so
        //   the recipient doesn't throw it away.
        changeOrigin: true,
      },
    },
  },
});
