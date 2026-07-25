// Import React and two hooks: useEffect for fetching data on mount, useState for storing it
import React, { useEffect, useState } from "react";
// Import the API function that fetches all categories and their joke counts
import { fetchCategories } from "../hooks/useJokes";

// Define the props that CategoryPicker accepts from its parent component
interface CategoryPickerProps {
  selected?: string;  // The currently selected category (undefined means "all categories")
  onChange: (category: string | undefined) => void;  // A callback function to tell the parent when the user picks a category
}

// The CategoryPicker component renders a row of filter buttons — one for "All" and one per category.
export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selected,  // Which category is currently active
  onChange,   // Function to call when the user clicks a category button
}) => {
  // Store the list of categories fetched from the server. Each entry has a name and a count of jokes in it.
  // Starts as an empty array while we wait for the fetch.
  const [categories, setCategories] = useState<{ category: string; count: number }[]>([]);

  // Fetch the categories from the server when the component first mounts.
  // The empty dependency array [] means this only runs once.
  useEffect(() => {
    fetchCategories()
      .then(setCategories)   // On success, store the fetched categories in state
      .catch(console.error);  // On failure, log the error to the browser console
  }, []); // No dependencies: run once on mount

  return (
    {/* A wrapper div for the entire category picker section */}
    <div className="category-picker">
      {/* A heading that tells the user what this section is for */}
      <h3 className="category-title">🗂️ Pick Your Pun Category</h3>
      {/* A flex container that holds all the category filter buttons in a row */}
      <div className="category-buttons">
        {/* The "All Groans" button — shows all jokes regardless of category */}
        <button
          {/* Apply the "active" CSS class (highlighted style) when no category is selected */}
          className={`category-btn ${!selected ? "active" : ""}`}
          {/* Clicking "All" passes undefined to the parent, which means "show all categories" */}
          onClick={() => onChange(undefined)}
        >
          All Groans
        </button>
        {/* Loop through each category from the server and render a button for it */}
        {categories.map((cat) => (
          {/* A button for each individual category */}
          <button
            {/* React needs a unique key for each item in a list for efficient updates */}
            key={cat.category}
            {/* Highlight this button if its category matches the currently selected one */}
            className={`category-btn ${selected === cat.category ? "active" : ""}`}
            {/* When clicked, tell the parent which category was selected */}
            onClick={() => onChange(cat.category)}
          >
            {/* Show the category name and how many jokes are in it, like "puns (12)" */}
            {cat.category} ({cat.count})
          </button>
        ))}
      </div>
    </div>
  );
};
