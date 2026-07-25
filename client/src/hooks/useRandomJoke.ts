// Import the React hooks we need: useState for storing data, useEffect for running code on mount, useCallback for memoizing
import { useState, useEffect, useCallback } from "react";
// Import the Joke type definition and the fetchRandomJoke API function from our useJokes module
import { Joke, fetchRandomJoke } from "./useJokes";

// Define a custom hook that manages loading and displaying a random joke.
// Custom hooks let us reuse stateful logic across multiple components.
export function useRandomJoke() {
  // joke stores the current random joke object, or null if none has been loaded yet.
  // Starting as null means "nothing loaded yet."
  const [joke, setJoke] = useState<Joke | null>(null);
  // loading tracks whether a fetch request is currently in progress.
  // Starts as true because we fetch a joke immediately when the hook mounts.
  const [loading, setLoading] = useState(true);
  // error stores an error message string if the fetch fails, or null if there's no error.
  const [error, setError] = useState<string | null>(null);

  // loadJoke is an async function that fetches a new random joke from the server.
  // useCallback wraps it so the function identity stays stable across renders (prevents unnecessary re-renders).
  // The empty dependency array [] means this function is created once and never recreated.
  const loadJoke = useCallback(async () => {
    // Show the loading spinner while we wait for the server
    setLoading(true);
    // Clear any previous error message before trying again
    setError(null);
    try {
      // Fetch a random joke from the API (this talks to the server and waits for a response)
      const newJoke = await fetchRandomJoke();
      // Store the joke we got from the server into our state so the component re-renders with it
      setJoke(newJoke);
    } catch (err) {
      // If the fetch failed, store the error message so we can display it to the user
      // We cast "err" to Error because TypeScript doesn't know what type a catch block error is
      setError((err as Error).message);
    } finally {
      // Whether the fetch succeeded or failed, stop showing the loading spinner
      // "finally" always runs, even if the try or catch blocks ran first
      setLoading(false);
    }
  }, []); // Empty array: this callback never changes after the first render

  // useEffect runs a side effect after the component first renders.
  // Here we call loadJoke() to fetch a joke as soon as the hook is used.
  // The dependency array [loadJoke] means "only re-run this if loadJoke changes."
  // Since loadJoke is wrapped in useCallback with [], it never changes, so this only runs once.
  useEffect(() => {
    loadJoke();
  }, [loadJoke]);

  // Return the joke data, loading state, error message, and a refresh function.
  // Components using this hook can destructure these: const { joke, loading, error, refresh } = useRandomJoke()
  return { joke, loading, error, refresh: loadJoke };
}
