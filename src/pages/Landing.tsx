import { Link } from 'react-router-dom';
import { TerminalSquare, ShieldAlert, Cpu, Bot, Cloud, Terminal } from 'lucide-react';

export function Landing() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)', fontFamily: 'var(--font-ui)' }}>
      {/* Navbar */}
      <nav style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)' }}>
          <TerminalSquare size={20} />
          <span style={{ fontWeight: 700, fontSize: '14px', letterSpacing: '0.5px', fontFamily: 'var(--font-code)' }}>DEV_PILOT</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-code)' }}>LOGIN</Link>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '12px', fontFamily: 'var(--font-code)' }}>INITIALIZE_WORKSPACE</Link>
        </div>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', textAlign: 'center' }}>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', marginBottom: '32px', fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>
          <Terminal size={14} className="text-accent" />
          <span>v2.0.0-rc.1 — IDE-GRADE AI ENGINEERING COPILOT</span>
        </div>

        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px', maxWidth: '800px', letterSpacing: '-1px' }}>
          Autonomous AI agent for <br/>
          <span style={{ color: 'var(--color-accent)' }}>production engineering.</span>
        </h1>
        
        <p style={{ fontSize: '1.1rem', color: 'var(--color-text-secondary)', maxWidth: '600px', marginBottom: '40px', lineHeight: 1.6 }}>
          DevPilot connects directly to your GitHub repositories to analyze architecture, audit security, debug issues, and generate enterprise-grade code.
        </p>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '64px' }}>
          <Link to="/signup" className="btn btn-primary" style={{ padding: '12px 24px', fontSize: '12px', gap: '8px', fontFamily: 'var(--font-code)' }}>
            <Cloud size={16} />
            CONNECT_GITHUB
          </Link>
          <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 24px', fontSize: '12px', fontFamily: 'var(--font-code)' }}>
            OPEN_WORKSPACE
          </Link>
        </div>

        {/* Feature Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', maxWidth: '1000px', width: '100%', textAlign: 'left' }}>
          <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <Cpu size={20} className="text-accent" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-code)' }}>ARCHITECTURE_ANALYSIS</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Automatically map your codebase architecture, extract dependencies, and visualize system graphs.
            </p>
          </div>
          
          <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <ShieldAlert size={20} className="text-accent" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-code)' }}>SECURITY_AUDITS</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Continuous SAST scanning. Identify vulnerabilities, secret leaks, and insecure patterns natively.
            </p>
          </div>

          <div style={{ padding: '24px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <Bot size={20} className="text-accent" style={{ marginBottom: '16px' }} />
            <h3 style={{ fontSize: '12px', fontWeight: 700, marginBottom: '8px', fontFamily: 'var(--font-code)' }}>AUTONOMOUS_RAG</h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
              Vectorized semantic search over your entire repository. AI understands your internal libraries.
            </p>
          </div>
        </div>

        {/* Console Preview */}
        <div style={{ marginTop: '64px', width: '100%', maxWidth: '1000px', textAlign: 'left', overflow: 'hidden', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
          <div style={{ borderBottom: '1px solid var(--color-border)', padding: '12px 16px', display: 'flex', gap: '8px', alignItems: 'center', backgroundColor: 'var(--color-surface-hover)' }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-error)' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-warning)' }}></div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--color-success)' }}></div>
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '12px', fontFamily: 'var(--font-code)' }}>devpilot — build</span>
          </div>
          <div style={{ padding: '24px', fontFamily: 'var(--font-code)', fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6, backgroundColor: 'var(--color-bg)' }}>
            <div style={{ color: 'var(--color-text-primary)' }}><span style={{ color: 'var(--color-accent)' }}>$</span> devpilot analyze --repo="yashsachan2307-png/devpilot"</div>
            <div style={{ marginTop: '8px' }}>[INFO] Fetching repository AST and metadata...</div>
            <div>[INFO] Indexing files into vector store (pgvector)...</div>
            <div>[INFO] Running static security analysis...</div>
            <div style={{ color: 'var(--color-success)', marginTop: '8px' }}>[SUCCESS] Analysis complete. 0 critical vulnerabilities found.</div>
            <div style={{ marginTop: '16px', color: 'var(--color-text-primary)' }}><span style={{ color: 'var(--color-accent)' }}>$</span> devpilot start --agent="engineering"</div>
            <div>[INFO] Engineering agent listening on port 8080...</div>
            <div className="animate-pulse" style={{ marginTop: '8px', display: 'inline-block', width: '8px', height: '14px', backgroundColor: 'var(--color-accent)' }}></div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--color-border)', padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-surface)', fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <TerminalSquare size={14} style={{ color: 'var(--color-accent)' }} />
          <span>DEV_PILOT © {new Date().getFullYear()}</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-primary">DOCUMENTATION</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-primary">API</span>
          <span style={{ cursor: 'pointer', transition: 'color 0.2s' }} className="hover:text-primary">GITHUB</span>
        </div>
      </footer>
    </div>
  );
}
