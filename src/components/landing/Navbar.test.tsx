import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Navbar } from './Navbar';
import { describe, it, expect } from 'vitest';

describe('Navbar Component', () => {
  it('renders logo and navigation links', () => {
    render(
      <MemoryRouter>
        <Navbar />
      </MemoryRouter>
    );

    // Verify logo text is rendered
    expect(screen.getByText('DevPilot')).toBeInTheDocument();

    // Verify navigation links are rendered
    expect(screen.getByText('Features')).toBeInTheDocument();
    expect(screen.getByText('Workflow')).toBeInTheDocument();
    expect(screen.getByText('Pricing')).toBeInTheDocument();
    expect(screen.getByText('FAQ')).toBeInTheDocument();

    // Verify auth buttons are rendered
    expect(screen.getByText('Log In')).toBeInTheDocument();
    expect(screen.getByText('Get Started')).toBeInTheDocument();
  });
});
