import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App', () => {
  it('renders the app title', () => {
    render(<App />);
    expect(screen.getAllByText(/Dad Jokes API/).length).toBeGreaterThanOrEqual(1);
  });
});
