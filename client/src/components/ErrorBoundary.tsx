import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Catches JavaScript errors anywhere in the child component tree
// Without this, a single error crashes the entire app
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            padding: "40px",
            textAlign: "center",
            background: "#1a1a2e",
            color: "#eee",
            minHeight: "100vh",
            fontFamily: "system-ui, sans-serif",
          }}>
            <h1>💀 Something broke</h1>
            <p style={{ color: "#aab", margin: "16px 0" }}>
              Even our error handler is groaning. Try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                background: "#e94560",
                color: "white",
                border: "none",
                borderRadius: "10px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              🔄 Try Again
            </button>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
