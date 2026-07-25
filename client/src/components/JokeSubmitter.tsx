// Import React and useState for managing the form's state
import React, { useState } from "react";
// Import the API function that sends a new joke to the server
import { submitJoke } from "../hooks/useJokes";
// Import the Toast component for showing success/error notifications
import { Toast } from "./Toast";

// Define the props that JokeSubmitter accepts
interface JokeSubmitterProps {
  onJokeSubmitted: () => void;  // A callback function the parent provides — called after a joke is successfully submitted
}

// A mapping of groan level numbers to funny descriptive labels.
// Used next to the groan level slider so the user knows what each number means.
const GROAN_LABELS: Record<number, string> = {
  1: "😐 barely a chuckle",           // Level 1: the joke barely registers
  2: "🙂 mild amusement",             // Level 2: a small smile
  3: "😏 a sly grin",                 // Level 3: a knowing smirk
  4: "🤣 a solid snort",              // Level 4: an involuntary snort
  5: "😤 respectable groan",          // Level 5: a classic dad groan
  6: "😤😤 a double groan",           // Level 6: so bad it deserves two groans
  7: "😫 eye roll + sigh",            // Level 7: full physical reaction
  8: "💀 soul-leaving-the-body",      // Level 8: the joke "killed" them
  9: "🫠 complete physical collapse", // Level 9: they melted into a puddle
  10: "☠️ transcendent groan — your dad would weep",  // Level 10: peak dad joke transcendence
};

// The JokeSubmitter component renders a form for users to submit their own dad jokes to the API.
export const JokeSubmitter: React.FC<JokeSubmitterProps> = ({ onJokeSubmitted }) => {
  // Each piece of form data gets its own state variable so we can track and update them independently.
  const [setup, setSetup] = useState("");            // The joke's setup line (typed by the user)
  const [punchline, setPunchline] = useState("");    // The joke's punchline (typed by the user)
  const [category, setCategory] = useState("classic"); // The selected category (defaults to "classic")
  const [groanLevel, setGroanLevel] = useState(5);   // The groan level slider value (defaults to 5 out of 10)
  const [author, setAuthor] = useState("");           // The user's "dad name" (optional, typed by the user)
  const [submitting, setSubmitting] = useState(false); // Whether a submission is currently in progress
  // The result message after submitting — stores success/failure status and a message string
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  // Whether the success toast notification is currently visible
  const [toastVisible, setToastVisible] = useState(false);

  // Handle the form submission when the user clicks the submit button.
  // The "e: React.FormEvent" parameter is the form submit event object.
  const handleSubmit = async (e: React.FormEvent) => {
    // Prevent the browser's default form behavior (which would reload the page)
    e.preventDefault();
    // Don't submit if the setup or punchline fields are empty or just whitespace
    if (!setup.trim() || !punchline.trim()) return;

    // Show the submitting state so the user knows something is happening
    setSubmitting(true);
    // Clear any previous result message
    setResult(null);

    try {
      // Send the joke data to the server via POST request
      await submitJoke({
        setup: setup.trim(),                // Trim whitespace from the setup
        punchline: punchline.trim(),        // Trim whitespace from the punchline
        category,                          // The selected category
        groan_level: groanLevel,            // The groan level from the slider
        author: author.trim() || "Anonymous Dad",  // Use the typed name, or default to "Anonymous Dad"
      });
      // If the submission succeeded, store a success message
      setResult({
        success: true,
        message: "🎉 Joke submitted! The Groan Council will convene at sundown.",
      });
      // Show the success toast notification
      setToastVisible(true);
      // Auto-hide the toast after 3 seconds
      setTimeout(() => setToastVisible(false), 3000);
      // Reset all form fields back to their defaults so the user can submit another joke
      setSetup("");
      setPunchline("");
      setAuthor("");
      setGroanLevel(5);
      // Tell the parent component that a joke was submitted, so it can refresh the joke list
      onJokeSubmitted();
    } catch (err) {
      // If the submission failed, show the error message from the server
      setResult({ success: false, message: (err as Error).message });
    } finally {
      // Whether success or failure, stop the submitting state
      setSubmitting(false);
    }
  };

  return (
    {/* A wrapper div for the entire submission form section */}
    <div className="joke-submitter">
      {/* A toast notification that appears briefly after a successful submission */}
      <Toast
        message="🏅 Your joke has been enshrined in the Hall of Groans!"
        type="success"
        visible={toastVisible}
      />
      {/* A heading for the form */}
      <h3 className="submitter-title">Submit Your Dad Joke</h3>
      {/* A subtitle explaining what the form is for, with a humorous tone */}
      <p className="submitter-subtitle">
        Share the pain. Let others groan at your humor. Remember: if your kids
        don't sigh, it's not a dad joke.
      </p>

      {/* The HTML form element. onSubmit fires handleSubmit when the user clicks submit or presses Enter. */}
      <form onSubmit={handleSubmit} className="submitter-form">
        {/* The "setup" input group — label + text field */}
        <div className="form-group">
          {/* The label tells the user what to type in the input field. htmlFor links it to the input's id for accessibility. */}
          <label htmlFor="setup">Setup (The wind-up)</label>
          {/* A text input for typing the joke's setup line */}
          <input
            id="setup"            // Matches the label's htmlFor for accessibility (clicking the label focuses the input)
            type="text"           // A single-line text input
            value={setup}         {/* Controlled input: React controls what's displayed */}
            {/* Every time the user types, update the setup state with the new text */}
            onChange={(e) => setSetup(e.target.value)}
            placeholder="I'm afraid for the calendar..."  {/* Grey hint text shown when the field is empty */}
            required              {/* The browser won't let the form submit if this is empty */}
            maxLength={500}       {/* Limit input to 500 characters to prevent excessively long jokes */}
          />
        </div>

        {/* The "punchline" input group — same pattern as setup */}
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

        {/* A horizontal row containing the category dropdown and author name input, side by side */}
        <div className="form-row">
          {/* The category dropdown group */}
          <div className="form-group">
            <label htmlFor="category">Category</label>
            {/* A dropdown select for choosing the joke's category */}
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {/* Each option has a value that gets stored in state when selected */}
              <option value="classic">Classic</option>    {/* Traditional dad jokes */}
              <option value="puns">Puns</option>          {/* Wordplay-based jokes */}
              <option value="animals">Animals</option>    {/* Animal-themed jokes */}
              <option value="food">Food</option>          {/* Food-related jokes */}
              <option value="science">Science</option>    {/* Science-themed jokes */}
              <option value="math">Math</option>          {/* Math-themed jokes */}
              <option value="smart">Big Brain</option>    {/* Clever/intellectual jokes */}
              <option value="work">Work</option>          {/* Workplace jokes */}
              <option value="geography">Geography</option>{/* Geography/location jokes */}
            </select>
          </div>

          {/* The author name input group */}
          <div className="form-group">
            <label htmlFor="author">Your Dad Name</label>
            <input
              id="author"
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Anonymous Dad"  {/* Placeholder shown if they leave it blank (server defaults to this too) */}
              maxLength={100}              {/* Prevent excessively long names */}
            />
          </div>
        </div>

        {/* The groan level slider group — lets users rate how groan-worthy their joke is */}
        <div className="form-group">
          <label htmlFor="groan">
            {/* Show the current groan level number */}
            Groan Level: {groanLevel}/10
            {/* Show the funny description for the current groan level */}
            <span className="groan-preview"> — {GROAN_LABELS[groanLevel]}</span>
          </label>
          {/* A horizontal range slider (drag to select a number 1-10) */}
          <input
            id="groan"
            type="range"     {/* Renders as a draggable slider */}
            min={1}          {/* Minimum value is 1 */}
            max={10}         {/* Maximum value is 10 */}
            value={groanLevel}
            {/* Convert the slider's string value to a number and update state */}
            onChange={(e) => setGroanLevel(parseInt(e.target.value))}
            className="groan-slider"  {/* Custom CSS styling for the slider's appearance */}
          />
        </div>

        {/* The submit button — disabled while submitting or if required fields are empty */}
        <button
          type="submit"       {/* This button submits the form when clicked */}
          className="btn btn-submit"
          {/* Disable if: a submission is in progress, OR the setup/punchline fields are empty */}
          disabled={submitting || !setup.trim() || !punchline.trim()}
        >
          {/* Show a different label while submitting vs. ready to submit */}
          {submitting ? "Consulting the Dad Council..." : "🎤 Drop the Punchline"}
        </button>

        {/* If there's a result message (success or error), show it below the button */}
        {result && (
          {/* Apply "success" or "error" class based on the result to style it green or red */}
          <div className={`submitter-result ${result.success ? "success" : "error"}`}>
            {/* Display the result message */}
            {result.message}
          </div>
        )}
      </form>
    </div>
  );
};
