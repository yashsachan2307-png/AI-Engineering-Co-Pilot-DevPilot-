import { Link } from 'react-router-dom';
import { 
  Clock, 
  ShieldAlert, 
  Activity, 
  TerminalSquare, 
  Network, 
  Cpu,
  GitCommit,
  GitBranch,
  Lock,
  Zap
} from 'lucide-react';

export function Overview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Top Status Bar (Terminal style) */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        padding: '12px 24px', 
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        fontFamily: 'var(--font-code)',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>REPO:</span>
            <span style={{ color: 'var(--color-text-primary)' }}>yashsachan2307-png/DevPilot</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>BRANCH:</span>
            <span style={{ color: 'var(--color-accent)' }}><GitBranch size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> main</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>HEAD:</span>
            <span style={{ color: 'var(--color-text-secondary)' }}><GitCommit size={12} style={{ display: 'inline', verticalAlign: 'text-bottom' }}/> a1b2c3d</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-success)' }}>
          <Activity size={12} />
          SYSTEM_OK
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* Main Content Area */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
          
          <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 4px 0' }}>Repository Overview</h1>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', margin: 0 }}>Static analysis and intelligence metrics.</p>
            </div>
            
            <div style={{ display: 'flex', gap: '8px' }}>
              <Link to="/dashboard/ai-assistant" className="btn btn-primary" style={{ fontFamily: 'var(--font-code)' }}>
                <TerminalSquare size={14} /> _ASK_COPILOT
              </Link>
              <Link to="/dashboard/architecture" className="btn btn-secondary" style={{ fontFamily: 'var(--font-code)' }}>
                <Network size={14} /> VIEW_GRAPH
              </Link>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1px', backgroundColor: 'var(--color-border)', marginBottom: '24px' }}>
            {[
              { label: 'FILES_INDEXED', value: '1,248', icon: Database, color: 'var(--color-text-primary)' },
              { label: 'AI_ENGINE', value: 'READY', icon: Cpu, color: 'var(--color-accent)' },
              { label: 'SECURITY_STATE', value: 'WARNING_3', icon: Lock, color: 'var(--color-warning)' },
              { label: 'PERF_SCORE', value: '98/100', icon: Zap, color: 'var(--color-success)' },
            ].map((metric, i) => (
              <div key={i} style={{ backgroundColor: 'var(--color-bg)', padding: '16px' }}>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)', marginBottom: '8px' }}>
                  {metric.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500, color: metric.color, fontFamily: 'var(--font-code)' }}>
                  <metric.icon size={14} /> {metric.value}
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: '0 0 12px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Subsystem Status
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', backgroundColor: 'var(--color-border)' }}>
            {[
              { sys: 'AST_ENGINE', status: 'ONLINE', uptime: '14h 22m', active: true },
              { sys: 'REPOSITORY_ANALYZER', status: 'READY', uptime: '2m ago', active: true },
              { sys: 'CONTEXT_ENGINE', status: 'SYNCED', uptime: '14h 22m', active: true },
              { sys: 'VULN_SCANNER', status: 'ACTIVE', uptime: '4h ago', active: false },
            ].map((sys, i) => (
              <div key={i} style={{ display: 'flex', padding: '12px 16px', backgroundColor: 'var(--color-bg)', alignItems: 'center' }}>
                <div style={{ width: '250px', fontFamily: 'var(--font-code)', fontSize: '12px', color: 'var(--color-text-primary)' }}>{sys.sys}</div>
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: sys.active ? 'var(--color-success)' : 'var(--color-warning)' }} />
                  <span style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: sys.active ? 'var(--color-success)' : 'var(--color-warning)' }}>{sys.status}</span>
                </div>
                <div style={{ fontFamily: 'var(--font-code)', fontSize: '12px', color: 'var(--color-text-muted)' }}>{sys.uptime}</div>
              </div>
            ))}
          </div>

        </div>

        {/* Right Sidebar - Event Log */}
        <div style={{ width: '320px', backgroundColor: 'var(--color-surface)', borderLeft: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Event Log
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--color-success)', marginTop: '2px' }}><Activity size={14} /></div>
              <div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--color-text-primary)' }}>SYNC_COMPLETE</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Parsed 432 files and updated embeddings.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>10m ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--color-accent)', marginTop: '2px' }}><TerminalSquare size={14} /></div>
              <div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--color-text-primary)' }}>COPILOT_QUERY</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Answered architecture query regarding Auth filter chain.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>1h ago</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <div style={{ color: 'var(--color-warning)', marginTop: '2px' }}><ShieldAlert size={14} /></div>
              <div>
                <div style={{ fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--color-text-primary)' }}>SEC_SCAN_COMPLETE</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '4px' }}>Detected 3 low-severity issues in controllers.</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '6px' }}>1d ago</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Mock icon component for Database since it was missing from imports
function Database(props: any) {
  return <svg xmlns="http://www.w3.org/2000/svg" width={props.size||24} height={props.size||24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>;
}
