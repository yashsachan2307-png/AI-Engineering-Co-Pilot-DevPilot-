import { Cpu, Network, Combine } from 'lucide-react';

export function Architecture() {
  return (
    <section className="landing-section">
      <div className="landing-text-center mb-12">
        <h2 style={{ fontSize: '2.25rem', fontWeight: 600, marginBottom: '1rem' }}>Built for Complex Systems</h2>
        <p className="landing-subtitle">DevPilot handles massive codebases without breaking a sweat.</p>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <Cpu size={32} className="text-accent mb-4" style={{ color: 'var(--color-accent)' }} />
          <h3 className="feature-title">Local LLM Integration</h3>
          <p className="feature-desc">Connect to your own local models (Llama 3, Mistral) for absolute privacy, or use our cloud API for maximum performance.</p>
        </div>
        <div className="feature-card">
          <Network size={32} className="text-accent mb-4" style={{ color: 'var(--color-accent)' }} />
          <h3 className="feature-title">Context-Aware Graph</h3>
          <p className="feature-desc">We build a semantic graph of your entire repository, linking functions, dependencies, and types across all your files.</p>
        </div>
        <div className="feature-card">
          <Combine size={32} className="text-accent mb-4" style={{ color: 'var(--color-accent)' }} />
          <h3 className="feature-title">Multi-Language Parsing</h3>
          <p className="feature-desc">Native AST parsing for TypeScript, Python, Rust, Go, and Java ensures deep syntactical understanding beyond plain text.</p>
        </div>
      </div>
    </section>
  );
}
