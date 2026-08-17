import { Link } from 'react-router-dom';
import { Terminal, ShieldAlert, Cpu, Bot, Github } from 'lucide-react';

export function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 16, height: 16, borderRadius: 2, backgroundColor: 'var(--color-accent)' }}></div>
          <span style={{ fontWeight: 600, fontSize: '14px', letterSpacing: '0.5px' }}>DevPilot</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn btn-secondary btn-sm" style={{ padding: '6px 12px' }}>Login</Link>
          <Link to="/signup" className="btn btn-primary btn-sm" style={{ padding: '6px 12px' }}>Start Building</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', marginBottom: '32px', fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          <Terminal size={14} className="text-accent" />
          <span>v2.0.0-rc.1 — IDE-Grade AI Engineering Copilot</span>
        </div>

        <h1 style={{ fontSize: '3rem', fontWeight: 700, lineHeight: 1.1, marginBottom: '24px', maxWidth: '800px', letterSpacing: '-0.5px' }}>
          The autonomous AI agent for <br/>
          <span style={{ color: 'var(--color-accent)' }}>production engineering.</span>
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
          DevPilot connects directly to your GitHub repositories to analyze architecture, audit security, debug issues, and generate enterprise-grade code.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '64px' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '14px', gap: '8px' }}>
            <Github size={16} />
            Connect GitHub
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '14px' }}>
            Open Workspace
          </Link>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '1000px', width: '100%', textAlign: 'left' }}>
          <div className="panel" style={{ padding: '24px' }}>
            <Cpu size={20} className="text-accent" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Architecture Analysis</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Automatically map your codebase architecture, extract dependencies, and visualize system graphs.
            </p>
          </div>
          
          <div className="panel" style={{ padding: '24px' }}>
            <ShieldAlert size={20} className="text-accent" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Security Audits</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Continuous SAST scanning. Identify vulnerabilities, secret leaks, and insecure patterns natively.
            </p>
          </div>

          <div className="panel" style={{ padding: '24px' }}>
            <Bot size={20} className="text-accent" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '8px' }}>Autonomous RAG</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Vectorized semantic search over your entire repository. AI understands your internal libraries.
            </p>
          </div>
        </div>

        {/* Console Preview */}
        <div className="panel" style={{ marginTop: '64px', width: '100%', maxWidth: '1000px', textAlign: 'left', overflow: 'hidden' }}>
          <div style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--color-surface)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#ef4444' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#f59e0b' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: '#10b981' }}></div>
            <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginLeft: '12px', fontFamily: 'var(--font-code)' }}>devpilot — build</span>
          </div>
          <div style={{ padding: '24px', fontFamily: 'var(--font-code)', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
            <div style={{ color: 'var(--color-text-primary)' }}>$ devpilot analyze --repo="yashsachan2307-png/devpilot"</div>
            <div style={{ marginTop: '8px' }}>[INFO] Fetching repository AST and metadata...</div>
            <div>[INFO] Indexing files into vector store (pgvector)...</div>
            <div>[INFO] Running static security analysis...</div>
            <div style={{ color: 'var(--color-accent)', marginTop: '8px' }}>[SUCCESS] Analysis complete. 0 critical vulnerabilities found.</div>
            <div style={{ marginTop: '8px', color: 'var(--color-text-primary)' }}>$ devpilot start --agent="engineering"</div>
            <div>[INFO] Engineering agent listening on port 8080...</div>
            <div className="animate-pulse" style={{ marginTop: '8px' }}>_</div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)', fontSize: '12px', color: 'var(--color-text-muted)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: 'var(--color-accent)' }}></div>
          <span>DevPilot © {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ color: 'inherit' }}>Documentation</span>
          <span style={{ color: 'inherit' }}>API</span>
          <span style={{ color: 'inherit' }}>GitHub</span>
        </div>
      </footer>
    </div>
  );
}
