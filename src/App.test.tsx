import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import App from '../src/App';

describe('App', () => {
  it('renders the main application structure', () => {
    render(<App />);

    // Check if the main heading is present
    expect(screen.getByText(/Controle Financeiro/i)).toBeInTheDocument();

    // Check for navigation elements (assuming you have a Navigation component or similar)
    expect(screen.getByRole('navigation')).toBeInTheDocument();

    // You can add more specific assertions based on your App.tsx content
    // For example, checking for the presence of Dashboard, Calendar, etc.
  });
});