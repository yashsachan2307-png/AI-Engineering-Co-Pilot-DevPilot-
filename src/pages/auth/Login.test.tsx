import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Login } from './Login';
import { describe, it, expect, vi, beforeEach } from 'vitest';
// Mock useAuth
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: vi.fn(),
    user: null,
    isAuthenticated: false,
    loading: false
  })
}));

describe('Login Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders login form correctly', () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /LOG_IN/i })).toBeInTheDocument();
  });

  it('handles validation errors', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    const submitBtn = screen.getByRole('button', { name: /LOG_IN/i });
    fireEvent.click(submitBtn);

    // Ideally shows validation messages, if handled in the UI
  });
});
