import { Activity as ActivityIcon, History, TerminalSquare } from 'lucide-react';

export function Activity() {
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
            <ActivityIcon size={16} />
            <span>SYSTEM_ACTIVITY_LOG</span>
          </div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', minWidth: '400px' }}>
          <TerminalSquare size={48} className="text-muted" style={{ opacity: 0.5 }} />
          <div style={{ textAlign: 'center', fontFamily: 'var(--font-code)' }}>
            <div style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '12px' }}>NO_RECENT_ACTIVITY</div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: '1.6' }}>
              Your recent AI generations, debug sessions,<br/>and repo scans will appear here.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
