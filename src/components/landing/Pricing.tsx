import { Check } from 'lucide-react';
import { Button } from '../ui/Button';

export function Pricing() {
  return (
    <section id="pricing" className="landing-section">
      <div className="landing-text-center mb-12">
        <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '1rem' }}>Simple, Transparent Pricing</h2>
        <p className="landing-subtitle">Choose the plan that fits your team's needs.</p>
      </div>

      <div className="pricing-grid">
        {/* Pro Plan */}
        <div className="pricing-card">
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Pro</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>For individual developers</p>
          </div>
          <div className="pricing-price">
            $20<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/mo</span>
          </div>
          <ul className="pricing-features">
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> Unlimited code generation</li>
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> IDE integration</li>
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> Basic repository context</li>
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> Standard models</li>
          </ul>
          <Button variant="secondary" className="w-full">Get Started</Button>
        </div>

        {/* Team Plan */}
        <div className="pricing-card featured">
          <div className="pricing-featured-badge">Most Popular</div>
          <div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Team</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.5rem' }}>For engineering teams</p>
          </div>
          <div className="pricing-price">
            $49<span style={{ fontSize: '1rem', fontWeight: 400, color: 'var(--color-text-secondary)' }}>/user/mo</span>
          </div>
          <ul className="pricing-features">
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> Everything in Pro</li>
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> Deep repository graph</li>
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> Automated PR reviews</li>
            <li className="pricing-feature"><Check size={20} style={{ color: 'var(--color-accent)' }} /> Advanced security scanning</li>
          </ul>
          <Button variant="primary" className="w-full">Start Free Trial</Button>
        </div>
      </div>
    </section>
  );
}
