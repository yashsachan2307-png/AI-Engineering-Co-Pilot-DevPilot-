import { Link } from 'react-router-dom';
import { Button } from '../ui/Button';
import { ChevronRight, GitBranch, Shield, Zap } from 'lucide-react';

export function Hero() {
  return (
    <section className="hero-section landing-text-center">
      <div className="hero-glow"></div>
      
      <div className="landing-section" style={{ paddingTop: 0 }}>
        <h1 className="landing-title">
          AI that understands your <br />
          <span style={{ color: 'var(--color-accent)' }}>entire development workflow.</span>
        </h1>
        
        <p className="landing-subtitle">
          An AI Engineering Copilot that understands your codebase and helps developers review, debug, generate, and improve software.
        </p>
        
        <div className="hero-actions">
          <Link to="/signup">
            <Button variant="primary" size="lg" className="gap-2">
              Start Building <ChevronRight size={18} />
            </Button>
          </Link>
          <a href="#features">
            <Button variant="secondary" size="lg">Explore Features</Button>
          </a>
        </div>

        {/* Visual Product Preview */}
        <div className="hero-preview">
          <div className="hero-preview-header">
            <div className="hero-preview-dots">
              <div className="hero-preview-dot dot-red"></div>
              <div className="hero-preview-dot dot-yellow"></div>
              <div className="hero-preview-dot dot-green"></div>
            </div>
            <div style={{ marginLeft: '1rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>
              devpilot-workspace — index.ts
            </div>
          </div>
          
          <div className="hero-preview-body">
            {/* Sidebar / Tree */}
            <div className="hero-preview-sidebar">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', textAlign: 'left', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)' }}><GitBranch size={16} /> main</div>
                <div style={{ paddingLeft: '1rem', marginTop: '1rem' }}>
                  <div style={{ color: 'var(--color-text-primary)' }}>src/</div>
                  <div style={{ paddingLeft: '1rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>components/</div>
                  <div style={{ paddingLeft: '1rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>services/</div>
                  <div style={{ paddingLeft: '1rem', color: 'var(--color-accent)', marginTop: '0.25rem' }}>index.ts</div>
                </div>
              </div>
            </div>
            
            {/* Code Area */}
            <div className="hero-preview-main text-left" style={{ textAlign: 'left' }}>
              <pre style={{ margin: 0, padding: 0 }}>
                <code>
{`// Analyzing dependencies and architecture...

import { CodeAnalyzer } from '@devpilot/core';

export async function reviewCodebase(path: string) {
  const analyzer = new CodeAnalyzer();
  const issues = await analyzer.scan(path, {
    depth: 'full',
    securityChecks: true
  });
  
  return issues.filter(i => i.severity === 'high');
}

// 🤖 Copilot: I noticed a potential race condition 
// on line 12. Would you like me to fix it?`}
                </code>
              </pre>
            </div>
            
            {/* Assistant / Issue Panel */}
            <div className="hero-preview-assistant">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontWeight: 600 }}>
                <Zap size={16} style={{ color: 'var(--color-warning)' }}/> Assistant
              </div>
              <div style={{ backgroundColor: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)', textAlign: 'left', fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                Found 3 potential improvements in index.ts
              </div>
              <div style={{ backgroundColor: 'var(--color-bg)', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-error)', textAlign: 'left', fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                <Shield size={14} style={{ color: 'var(--color-error)', flexShrink: 0, marginTop: '2px' }} />
                <span>Security vulnerability in dependency parsing.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
