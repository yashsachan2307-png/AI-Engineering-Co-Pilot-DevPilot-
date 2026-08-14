import { Lock, Shield, UserCheck } from 'lucide-react';

export function Security() {
  return (
    <section className="workflow-section">
      <div className="landing-section">
        <div className="landing-text-center mb-12">
          <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '1rem' }}>Enterprise-Grade Security</h2>
          <p className="landing-subtitle">Your code never leaves your secure environment unless you want it to.</p>
        </div>

        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              <Shield size={32} style={{ color: 'var(--color-success)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Zero Data Retention</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>We never store your proprietary code on our servers after processing.</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              <Lock size={32} style={{ color: 'var(--color-success)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>E2E Encryption</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>All data in transit is encrypted using industry-standard TLS 1.3.</p>
          </div>
          
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ display: 'inline-flex', padding: '1rem', borderRadius: '50%', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', marginBottom: '1rem' }}>
              <UserCheck size={32} style={{ color: 'var(--color-success)' }} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>SOC2 Compliant</h3>
            <p style={{ color: 'var(--color-text-secondary)' }}>Our infrastructure and processes meet rigorous security standards.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
