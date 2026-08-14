import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';

export function CTA() {
  return (
    <section className="cta-section">
      <h2 style={{ fontSize: '3rem', fontWeight: 700, marginBottom: '1.5rem', letterSpacing: '-0.05em' }}>
        Ready to upgrade your engineering workflow?
      </h2>
      <p style={{ fontSize: '1.25rem', color: 'var(--color-text-secondary)', marginBottom: '3rem', maxWidth: '600px', margin: '0 auto 3rem' }}>
        Join thousands of developers shipping better code faster with DevPilot.
      </p>
      <Link to="/signup">
        <Button variant="primary" size="lg">Get Started for Free</Button>
      </Link>
    </section>
  );
}
