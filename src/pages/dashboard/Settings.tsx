import { Settings as SettingsIcon, User, Link as LinkIcon, TerminalSquare } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function Settings() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
      {/* Top Context Bar */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '12px 24px', 
        borderBottom: '1px solid var(--color-border)',
        backgroundColor: 'var(--color-surface)',
        flexShrink: 0 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
            <TerminalSquare size={16} />
            <span>SYSTEM_CONFIGURATION</span>
          </div>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px' }}>
          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <User size={14} className="text-secondary" />
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>USER_PROFILE</h2>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '16px', margin: '0 0 16px 0', fontFamily: 'var(--font-code)' }}>Manage your account settings and preferences.</p>
              <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)' }}>[PROFILE_DATA_AWAITING_INITIALIZATION]</p>
              </div>
              <Button className="btn-secondary" style={{ fontSize: '11px', fontFamily: 'var(--font-code)', padding: '6px 12px' }}>
                EDIT_PROFILE
              </Button>
            </div>
          </div>

          <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <LinkIcon size={14} className="text-secondary" />
              <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>INTEGRATIONS</h2>
            </div>
            <div style={{ padding: '16px' }}>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '16px', margin: '0 0 16px 0', fontFamily: 'var(--font-code)' }}>Connect DevPilot with your external tools.</p>
              <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '16px', marginBottom: '16px' }}>
                <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)' }}>[NO_ACTIVE_INTEGRATIONS_DETECTED]</p>
              </div>
              <Button className="btn-secondary" style={{ fontSize: '11px', fontFamily: 'var(--font-code)', padding: '6px 12px' }}>
                CONFIGURE_INTEGRATIONS
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
