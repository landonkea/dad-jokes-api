// Import React and the useState and useCallback hooks for managing state and memoizing functions
import React, { useState, useCallback } from "react";
// Import our custom hook that handles fetching and storing a random joke
import { useRandomJoke } from "../hooks/useRandomJoke";
// Import the API function that sends a vote (up or down) to the server
import { voteJoke } from "../hooks/useJokes";
// Import the Confetti component that renders a celebratory particle explosion
import { Confetti } from "./Confetti";
// Import the Toast component that shows temporary notification messages
import { Toast } from "./Toast";

// Define reaction message buckets based on groan level.
// Each bucket has a minimum groan level and an array of funny reaction strings to randomly pick from.
// Higher groan levels get more dramatic reactions.
const REACTIONS = [
  // Groan level 9-10: extreme reactions — the joke was so bad it "ended" them
  { min: 9, texts: ["💀 That joke just ended me.", "🫠 I'm liquefied from that groan.", "⚰️ Call a priest, that joke was demonic."] },
  // Groan level 7-8: strong reactions — neighbors heard the groan
  { min: 7, texts: ["😤 My neighbors heard that groan.", "🙄 I rolled my eyes so hard they did a 360.", "🫡 Respect. That was painfully good."] },
  // Groan level 5-6: moderate reactions — respectable groans
  { min: 5, texts: ["😐 A solid 'dad nod' of approval.", "😤 A respectable groan. Father would be proud.", "🫢 I smiled. Don't tell anyone."] },
  // Groan level 0-4: mild reactions — surprisingly funny or barely a chuckle
  { min: 0, texts: ["😂 Wait... that was actually funny?", "🤨 Are you sure you're a dad?", "✨ A rare gem in a sea of groans."] },
];

// Helper function that picks a random reaction message based on the joke's groan level.
function getReaction(level: number): string {
  // Find the first bucket where the joke's groan level meets the minimum threshold.
  // The "!" asserts to TypeScript that we will always find a match (level 0+ always matches the last bucket).
  const bucket = REACTIONS.find((r) => level >= r.min)!;
  // Pick a random reaction string from that bucket's texts array.
  // Math.random() gives a number 0-1, multiply by array length, floor it to get a valid index.
  return bucket.texts[Math.floor(Math.random() * bucket.texts.length)];
}

// The JokeCard component displays a single random joke with voting, punchline reveal, and fun effects.
export const JokeCard: React.FC = () => {
  // Use our custom hook to get the current random joke, loading/error states, and a refresh function
  const { joke, loading, error, refresh } = useRandomJoke();
  // Track whether the user has voted on this joke: "up", "down", or null (no vote yet)
  const [voted, setVoted] = useState<"up" | "down" | null>(null);
  // Track whether the punchline is visible. Starts hidden so the user can build anticipation.
  const [showPunchline, setShowPunchline] = useState(false);
  // Track whether a vote request is currently being sent to the server (to prevent double-clicking)
  const [voteLoading, setVoteLoading] = useState(false);
  // Track whether the confetti animation should be playing right now
  const [confettiTrigger, setConfettiTrigger] = useState(false);
  // The text message currently shown in the toast notification
  const [toastMsg, setToastMsg] = useState("");
  // Whether the toast notification is currently visible on screen
  const [toastVisible, setToastVisible] = useState(false);
  // The color/style type of the toast: "success" (green), "error" (red), or "info" (blue)
  const [toastType, setToastType] = useState<"success" | "error" | "info">("info");

  // Helper function to show a toast notification with a message and type.
  // It sets the message, makes the toast visible, then hides it after 2.5 seconds.
  const showToast = (msg: string, type: "success" | "error" | "info" = "info") => {
    setToastMsg(msg);          // Set the message text
    setToastType(type);        // Set the visual style (success/error/info)
    setToastVisible(true);     // Make the toast appear on screen
    // After 2500 milliseconds (2.5 seconds), hide the toast by setting visible to false
    setTimeout(() => setToastVisible(false), 2500);
  };

  // Handle when the user clicks the upvote or downvote button.
  // This is async because it needs to wait for the server to process the vote.
  const handleVote = async (voteType: "up" | "down") => {
    // Don't do anything if: no joke loaded, user already voted, or a vote request is in progress
    if (!joke || voted || voteLoading) return;
    // Show the loading state so the user knows something is happening
    setVoteLoading(true);
    try {
      // Send the vote to the server and get back the updated joke with new vote counts
      await voteJoke(joke.id, voteType);
      // Record that the user has voted so we can disable the vote buttons
      setVoted(voteType);
      if (voteType === "up") {
        // If they upvoted, trigger the confetti celebration animation
        setConfettiTrigger(true);
        // Show a success toast congratulating them on their good taste
        showToast("🎉 You have good taste in dad jokes!", "success");
      } else {
        // If they downvoted, show a playful "that was harsh" error toast
        showToast("👎 Harsh. Even bad jokes have feelings.", "error");
      }
    } catch (err) {
      // If the vote request failed (e.g., server error), show an error toast
      showToast("Vote failed. The joke server is crying.", "error");
    } finally {
      // Whether the vote succeeded or failed, turn off the loading state
      setVoteLoading(false);
    }
  };

  // Handle when the user clicks the "Another One" button to load a new random joke.
  const handleNewJoke = () => {
    setVoted(null);        // Reset the vote so the buttons become clickable again
    setShowPunchline(false); // Hide the punchline again for the new joke
    refresh();              // Fetch a new random joke from the server
  };

  // Handle when the user clicks the "Reveal the Punchline" button.
  const handleReveal = () => {
    // Make the punchline text visible
    setShowPunchline(true);
    // If the joke's groan level is 8 or higher, trigger confetti after a short delay for dramatic effect
    if (joke && joke.groan_level >= 8) {
      // 400ms delay so the punchline appears first, then the confetti fires
      setTimeout(() => setConfettiTrigger(true), 400);
    }
  };

  // If we're still loading a joke, show a loading spinner instead of the card
  if (loading) {
    return (
      {/* A styled card container for the loading state */}
      <div className="joke-card">
        {/* A centered loading message with a spinning animation */}
        <div className="joke-loading">
          {/* The CSS-animated spinner element (a rotating circle) */}
          <div className="spinner" />
          {/* A funny loading message to keep the user entertained while waiting */}
          <p>Rummaging through dad's joke vault...</p>
        </div>
      </div>
    );
  }

  // If an error occurred while fetching, show an error message with a retry button
  if (error) {
    return (
      {/* A card container with an error-specific class for red/error styling */}
      <div className="joke-card joke-error">
        {/* Display the error message with a shocked emoji */}
        <p>😱 {error}</p>
        {/* A humorous explanation for why the error might have happened */}
        <p className="joke-error-sub">
          The joke server is probably on a dad break. You know how they are — 30
          minutes in the garage and suddenly they've invented a new tool.
        </p>
        {/* A button to retry fetching a joke. Calls handleNewJoke which resets state and fetches a new joke. */}
        <button onClick={handleNewJoke} className="btn btn-primary">
          Try Again (I believe in you)
        </button>
      </div>
    );
  }

  // If somehow there's no joke and no error and no loading, render nothing
  if (!joke) return null;

  // Main joke card rendering — shown when we have a loaded joke with no errors
  return (
    {/* The card container. key={joke.id} forces React to re-mount the card when a new joke loads, resetting animations. */}
    <div className="joke-card" key={joke.id}>
      {/* The confetti explosion overlay — trigger controls when it fires, onComplete resets it */}
      <Confetti trigger={confettiTrigger} onComplete={() => setConfettiTrigger(false)} />
      {/* The toast notification that appears temporarily at the top of the card */}
      <Toast message={toastMsg} type={toastType} visible={toastVisible} />

      {/* A colored badge showing which category this joke belongs to (e.g., "puns", "animals") */}
      <div className="joke-category-badge">{joke.category}</div>

      {/* The "groan meter" — a visual representation of how groan-worthy the joke is */}
      <div className="joke-groan-meter">
        {/* Label text */}
        <span>Groan Level: </span>
        {/* Show a 😫 emoji for each point in the groan level (e.g., level 7 = 7 emojis) */}
        <span className="groan-eyes">
          {/* Array.from creates an array of the right length, then join combines them into one string */}
          {Array.from({ length: joke.groan_level }, (_, i) => "😫").join("")}
        </span>
        {/* Show the numeric value like "7/10" next to the emojis */}
        <span className="groan-number">{joke.groan_level}/10</span>
      </div>

      {/* The joke's setup line — the first part that builds anticipation */}
      <div className="joke-setup">
        {/* A small label identifying this as the setup */}
        <span className="joke-label">Setup:</span>
        {/* The actual setup text */}
        <p>{joke.setup}</p>
      </div>

      {/* Conditional rendering: if punchline is hidden, show the reveal button; otherwise show the punchline */}
      {!showPunchline ? (
        {/* The reveal button — clicking it shows the punchline */}
        <button className="btn btn-punchline" onClick={handleReveal}>
          🥁 Reveal the Punchline 🥁
        </button>
      ) : (
        {/* The punchline section, shown after the user clicks reveal */}
        <div className="joke-punchline reveal">
          {/* A small label identifying this as the punchline */}
          <span className="joke-label">Punchline:</span>
          {/* The actual punchline text, styled with a special class for a reveal animation */}
          <p className="punchline-text">{joke.punchline}</p>
          {/* A random reaction message based on how groan-worthy the joke is */}
          <p className="joke-reaction">{getReaction(joke.groan_level)}</p>
        </div>
      )}

      {/* The bottom section of the card with voting buttons and the author's name */}
      <div className="joke-footer">
        {/* The voting buttons container */}
        <div className="joke-votes">
          {/* The upvote button — adds 1 to the displayed count if the user just upvoted */}
          <button
            {/* Apply the "voted" CSS class if the user already upvoted (gives it a highlighted look) */}
            className={`vote-btn upvote ${voted === "up" ? "voted" : ""}`}
            {/* When clicked, call handleVote with "up" as the vote type */}
            onClick={() => handleVote("up")}
            {/* Disable the button if the user already voted or a vote is in progress */}
            disabled={!!voted || voteLoading}
          >
            {/* Show the thumbs up emoji and the current upvote count (plus 1 if user just upvoted) */}
            👍 {joke.upvotes + (voted === "up" ? 1 : 0)}
          </button>
          {/* The downvote button — same logic as upvote but for downvotes */}
          <button
            className={`vote-btn downvote ${voted === "down" ? "voted" : ""}`}
            onClick={() => handleVote("down")}
            disabled={!!voted || voteLoading}
          >
            {/* Show the thumbs down emoji and the current downvote count (plus 1 if user just downvoted) */}
            👎 {joke.downvotes + (voted === "down" ? 1 : 0)}
          </button>
        </div>
        {/* Show who submitted the joke, prefixed with an em dash for a clean look */}
        <span className="joke-author">— {joke.author}</span>
      </div>

      {/* A button to fetch and display a different random joke */}
      <button onClick={handleNewJoke} className="btn btn-secondary">
        🔄 Another One (Dj Khaled voice)
      </button>
    </div>
  );
};
