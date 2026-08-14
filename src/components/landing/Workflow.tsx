import { GitPullRequest, Laptop, Server } from 'lucide-react';

export function Workflow() {
  const steps = [
    {
      icon: <Laptop size={32} className="text-accent" style={{ color: 'var(--color-accent)' }} />,
      title: '1. Code locally with context',
      desc: 'DevPilot runs in the background, analyzing your local changes against the broader repository context in real-time.',
      visual: (
        <div style={{ fontFamily: 'var(--font-code)', fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'left' }}>
          <div>$ devpilot watch ./src</div>
          <div style={{ color: 'var(--color-success)', marginTop: '1rem' }}>✓ Indexed 4,281 files</div>
          <div style={{ marginTop: '0.5rem' }}>Watching for changes...</div>
        </div>
      )
    },
    {
      icon: <GitPullRequest size={32} className="text-accent" style={{ color: 'var(--color-accent)' }} />,
      title: '2. Review & Optimize',
      desc: 'When you open a PR, DevPilot automatically posts a review, suggesting optimizations and pointing out logical flaws.',
      visual: (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%', maxWidth: '400px' }}>
          <div style={{ padding: '1rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', textAlign: 'left' }}>
            <div style={{ fontWeight: 600, marginBottom: '0.5rem' }}>DevPilot Bot</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>This database query inside the loop will cause an N+1 performance issue. Consider using a JOIN.</div>
          </div>
        </div>
      )
    },
    {
      icon: <Server size={32} className="text-accent" style={{ color: 'var(--color-accent)' }} />,
      title: '3. Deploy with confidence',
      desc: 'Merge confidently knowing your code has been thoroughly vetted by an AI that understands your entire system architecture.',
      visual: (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '4px solid var(--color-success)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <span style={{ fontSize: '2rem' }}>🚀</span>
          </div>
          <div style={{ fontWeight: 600, color: 'var(--color-success)' }}>All Checks Passed</div>
        </div>
      )
    }
  ];

  return (
    <section id="workflow" className="workflow-section">
      <div className="landing-section">
        <div className="landing-text-center mb-12">
          <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '1rem' }}>How DevPilot Works</h2>
          <p className="landing-subtitle">A seamless integration into your existing development lifecycle.</p>
        </div>

        <div className="workflow-steps">
          {steps.map((step, i) => (
            <div key={i} className="workflow-step">
              <div className="workflow-step-content text-left" style={{ textAlign: 'left' }}>
                <div style={{ marginBottom: '1.5rem' }}>{step.icon}</div>
                <h3 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem' }}>{step.title}</h3>
                <p style={{ color: 'var(--color-text-secondary)', fontSize: '1.125rem', lineHeight: 1.6 }}>{step.desc}</p>
              </div>
              <div className="workflow-step-visual">
                {step.visual}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
