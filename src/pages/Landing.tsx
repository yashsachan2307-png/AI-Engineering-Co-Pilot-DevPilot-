import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';

export function Landing() {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <main className="text-center max-w-2xl px-4">
        <h1 className="text-5xl font-bold tracking-tight mb-6" style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem' }}>
          Welcome to <span style={{ color: 'var(--color-accent)' }}>DevPilot</span>
        </h1>
        <p className="text-xl mb-8" style={{ color: 'var(--color-text-secondary)', fontSize: '1.25rem', marginBottom: '2rem' }}>
          The serious AI Engineering Copilot. Ship better code, faster.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/login">
            <Button variant="primary" size="lg">Log In</Button>
          </Link>
          <Link to="/signup">
            <Button variant="secondary" size="lg">Sign Up</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
