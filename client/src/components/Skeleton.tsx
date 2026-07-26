import React from "react";

// Shows a shimmer placeholder while content loads
// Better UX than a spinner because it shows the shape of incoming content
export const JokeCardSkeleton: React.FC = () => (
  <div className="joke-card" style={{ animation: "none" }}>
    <div style={{
      height: "24px",
      width: "80px",
      background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
      backgroundSize: "200% 100%",
      borderRadius: "20px",
      marginBottom: "16px",
      animation: "skeletonShimmer 1.5s infinite",
    }} />
    <div style={{
      height: "16px",
      width: "60%",
      background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
      backgroundSize: "200% 100%",
      borderRadius: "8px",
      marginBottom: "24px",
      animation: "skeletonShimmer 1.5s infinite 0.1s",
    }} />
    <div style={{
      height: "20px",
      width: "100%",
      background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
      backgroundSize: "200% 100%",
      borderRadius: "8px",
      marginBottom: "10px",
      animation: "skeletonShimmer 1.5s infinite 0.2s",
    }} />
    <div style={{
      height: "20px",
      width: "80%",
      background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
      backgroundSize: "200% 100%",
      borderRadius: "8px",
      marginBottom: "24px",
      animation: "skeletonShimmer 1.5s infinite 0.3s",
    }} />
    <div style={{
      height: "48px",
      width: "100%",
      background: "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.08), rgba(255,255,255,0.04))",
      backgroundSize: "200% 100%",
      borderRadius: "14px",
      animation: "skeletonShimmer 1.5s infinite 0.4s",
    }} />
  </div>
);
