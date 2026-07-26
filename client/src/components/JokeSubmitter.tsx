// Import React and useState for managing the form's state
import React, { useState } from "react";
// Import the API function that sends a new joke to the server
import { submitJoke } from "../hooks/useJokes";
// Import the Toast component for showing success/error notifications
import { Toast } from "./Toast";

// Define the props that JokeSubmitter accepts
interface JokeSubmitterProps {
  // A callback function the parent provides — called after a joke is successfully submitted
  onJokeSubmitted: () => void;
}

// A mapping of groan level numbers to funny descriptive labels.
// Used next to the groan level slider so the user knows what each number means.
const GROAN_LABELS: Record<number, string> = {
  1: "😐 barely a chuckle",
  2: "🙂 mild amusement",
  3: "😏 a sly grin",
  4: "🤣 a solid snort",
  5: "😤 respectable groan",
  6: "😤😤 a double groan",
  7: "😫 eye roll + sigh",
  8: "💀 soul-leaving-the-body",
  9: "🫠 complete physical collapse",
  10: "☠️ transcendent groan — your dad would weep",
};

// The JokeSubmitter component renders a form for users to submit their own dad jokes
export const JokeSubmitter: React.FC<JokeSubmitterProps> = ({ onJokeSubmitted }) => {
  // Each piece of form data gets its own state variable
  const [setup, setSetup] = useState("");
  const [punchline, setPunchline] = useState("");
  const [category, setCategory] = useState("classic");
  const [groanLevel, setGroanLevel] = useState(5);
  const [author, setAuthor] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Handle the form submission when the user clicks the submit button
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the browser's default form behavior (which would reload the page)
    e.preventDefault();
    // Don't submit if the setup or punchline fields are empty
    if (!setup.trim() || !punchline.trim()) return;

    setSubmitting(true);
    setResult(null);

    try {
      // Send the joke data to the server via POST request
      await submitJoke({
        setup: setup.trim(),
        punchline: punchline.trim(),
        category,
        groan_level: groanLevel,
        author: author.trim() || "Anonymous Dad",
      });
      // Store a success message
      setResult({
        success: true,
        message: "🎉 Joke submitted! The Groan Council will convene at sundown.",
      });
      // Show the success toast notification
      setToastVisible(true);
      // Auto-hide the toast after 3 seconds
      setTimeout(() => setToastVisible(false), 3000);
      // Reset all form fields back to their defaults
      setSetup("");
      setPunchline("");
      setAuthor("");
      setGroanLevel(5);
      // Tell the parent component to refresh the joke list
      onJokeSubmitted();
    } catch (err) {
      setResult({ success: false, message: (err as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="joke-submitter">
      <Toast
        message="🏅 Your joke has been enshrined in the Hall of Groans!"
        type="success"
        visible={toastVisible}
      />
      <h3 className="submitter-title">Submit Your Dad Joke</h3>
      <p className="submitter-subtitle">
        Share the pain. Let others groan at your humor. Remember: if your kids
        don't sigh, it's not a dad joke.
      </p>

      <form onSubmit={handleSubmit} className="submitter-form">
        <div className="form-group">
          <label htmlFor="setup">Setup (The wind-up)</label>
          <input
            id="setup"
            type="text"
            value={setup}
            onChange={(e) => setSetup(e.target.value)}
            placeholder="I'm afraid for the calendar..."
            required
            maxLength={500}
          />
        </div>
        <div className="form-group">
          <label htmlFor="punchline">Punchline (The groan inducer)</label>
          <input
            id="punchline"
            type="text"
            value={punchline}
            onChange={(e) => setPunchline(e.target.value)}
            placeholder="Its days are numbered."
            required
            maxLength={500}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="classic">Classic</option>
              <option value="puns">Puns</option>
              <option value="animals">Animals</option>
              <option value="food">Food</option>
              <option value="science">Science</option>
              <option value="math">Math</option>
              <option value="smart">Big Brain</option>
              <option value="work">Work</option>
              <option value="geography">Geography</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="author">Your Dad Name</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Anonymous Dad"
              maxLength={100}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="groan">
            Groan Level: {groanLevel}/10
            <span className="groan-preview"> — {GROAN_LABELS[groanLevel]}</span>
          </label>
          <input
            id="groan"
            type="range"
            min={1}
            max={10}
            value={groanLevel}
            onChange={(e) => setGroanLevel(parseInt(e.target.value))}
            className="groan-slider"
          />
        </div>
        <button
          type="submit"
          className="btn btn-submit"
          disabled={submitting || !setup.trim() || !punchline.trim()}
        >
          {submitting ? "Consulting the Dad Council..." : "🎤 Drop the Punchline"}
        </button>
        {result && (
          <div className={`submitter-result ${result.success ? "success" : "error"}`}>
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
};
