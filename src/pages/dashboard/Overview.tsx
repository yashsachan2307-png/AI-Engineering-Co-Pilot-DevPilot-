import { Link } from 'react-router-dom';
import { 
  Clock, 
  ShieldAlert, 
  Activity, 
  TerminalSquare, 
  Network, 
  Cpu 
} from 'lucide-react';

export function Overview() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Top Metrics Bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1px', backgroundColor: 'var(--color-border)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
        
        <div style={{ backgroundColor: 'var(--color-surface)', padding: '16px' }}>
          <div className="text-muted text-xs font-medium uppercase tracking-wider mb-1">Active Repository</div>
          <div className="text-primary font-semibold text-base flex items-center gap-2">
            yashsachan2307-png/DevPilot
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: '16px' }}>
          <div className="text-muted text-xs font-medium uppercase tracking-wider mb-1">Last Analysis</div>
          <div className="text-primary font-semibold text-base flex items-center gap-2">
            <Clock size={14} className="text-secondary" />
            2 minutes ago
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: '16px' }}>
          <div className="text-muted text-xs font-medium uppercase tracking-wider mb-1">System Health</div>
          <div className="text-success font-semibold text-base flex items-center gap-2">
            <Activity size={14} />
            All systems operational
          </div>
        </div>

        <div style={{ backgroundColor: 'var(--color-surface)', padding: '16px' }}>
          <div className="text-muted text-xs font-medium uppercase tracking-wider mb-1">AI Engine</div>
          <div className="text-accent font-semibold text-base flex items-center gap-2">
            <Cpu size={14} />
            Gemini Pro (Connected)
          </div>
        </div>

      </div>

      <div className="split-pane" style={{ height: 'auto', gap: '24px' }}>
        {/* Left Column: Repository Details */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Code Metrics & Security</h3>
            </div>
            <div className="card-content" style={{ padding: 0 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Total Files</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-code)', textAlign: 'right' }}>1,248</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Java Classes</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-code)', textAlign: 'right' }}>432</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Security Findings</td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <span className="badge badge-warning">3 Warnings</span>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>Dependencies</td>
                    <td style={{ padding: '12px 16px', fontFamily: 'var(--font-code)', textAlign: 'right' }}>42</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Quick Actions</h3>
            </div>
            <div className="card-content" style={{ display: 'flex', gap: '12px' }}>
              <Link to="/dashboard/ai-assistant" className="btn btn-primary">
                <TerminalSquare size={14} /> Ask Copilot
              </Link>
              <Link to="/dashboard/architecture" className="btn btn-secondary">
                <Network size={14} /> View Architecture
              </Link>
              <Link to="/dashboard/security" className="btn btn-secondary">
                <ShieldAlert size={14} /> Security Scan
              </Link>
            </div>
          </div>
          
        </div>

        {/* Right Column: Recent Activity */}
        <div style={{ flex: 1 }}>
          <div className="card" style={{ height: '100%' }}>
            <div className="card-header">
              <h3 className="card-title">Recent Activity</h3>
            </div>
            <div className="card-content" style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingTop: '16px' }}>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: 'var(--color-success)', marginTop: '2px' }}><Activity size={14} /></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Repository Sync Completed</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Parsed 432 files and updated embeddings.</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>10 minutes ago</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: 'var(--color-accent)', marginTop: '2px' }}><TerminalSquare size={14} /></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>AI Copilot Session</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Answered architecture query regarding Auth filter chain.</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>1 hour ago</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ color: 'var(--color-warning)', marginTop: '2px' }}><ShieldAlert size={14} /></div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>Security Scan</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Detected 3 low-severity issues in controllers.</div>
                  <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Yesterday</div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
