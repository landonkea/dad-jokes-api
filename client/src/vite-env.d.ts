// =============================================================================
// Vite Environment Type Declarations
// =============================================================================
// This file tells TypeScript (our type-checking language) about special
// variables and features that Vite provides automatically.
//
// Without this file, TypeScript would complain that it doesn't know what
// "import.meta.env" is or what special Vite features exist.
//
// The line below basically says: "Hey TypeScript, Vite has its own types
// (definitions of available features). Please load those in."
// =============================================================================

/// <reference types="vite/client" />
// ^ This is a special TypeScript instruction (called a "triple-slash directive").
//   It pulls in Vite's built-in type definitions. This gives TypeScript
//   knowledge about things like:
//     - import.meta.env.VITE_SOME_VAR (environment variables)
//     - Special import methods for images, JSON files, etc.
//   You almost never need to change this line. It just makes the
//   red squiggly underlines go away in your editor.
