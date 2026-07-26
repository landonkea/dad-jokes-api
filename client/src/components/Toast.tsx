// Import React so we can use JSX syntax to define the component
import React, { useEffect, useState } from "react";

// Define the props (inputs) that the Toast component accepts from its parent
interface ToastProps {
  message: string;                              // The text to display inside the toast notification
  type?: "success" | "error" | "info";         // The visual style — green for success, red for error, blue for info. The "?" means it's optional (defaults to "info").
  visible: boolean;                             // Whether the toast is currently shown on screen or hidden
}

// The Toast component is a small popup notification that appears briefly to give the user feedback.
// It slides in/out based on the "visible" prop and changes color based on "type".
export const Toast: React.FC<ToastProps> = ({ message, type = "info", visible }) => {
  return (
    <div className={`toast ${type} ${visible ? "visible" : ""}`}>
      {message}
    </div>
  );
};
