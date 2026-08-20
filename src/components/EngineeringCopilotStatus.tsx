import { useState, useEffect } from 'react';
import { Terminal } from 'lucide-react';

const SIMULATION_STATES = [
  '> indexing repository...',
  '> scanning source tree...',
  '> analyzing dependencies...',
  '> constructing AST...',
  '> running static analysis...',
  '> correlating repository context...',
  '> synchronizing AI context...',
  '> intelligence engine ready'
];

export function EngineeringCopilotStatus() {
  const [currentStateIndex, setCurrentStateIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  // Blinking cursor effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  // State cycling effect
  useEffect(() => {
    const stateInterval = setInterval(() => {
      setCurrentStateIndex((prev) => (prev + 1) % SIMULATION_STATES.length);
    }, 2500);
    return () => clearInterval(stateInterval);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
      padding: '16px 16px',
      backgroundColor: 'var(--color-bg)',
      borderBottom: '1px solid var(--color-border)',
      fontFamily: 'var(--font-code)',
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px', 
        color: 'var(--color-text-primary)',
        fontSize: '12px',
        fontWeight: 600,
        letterSpacing: '0.5px'
      }}>
        <Terminal size={14} className="text-accent" />
        ENGINEERING COPILOT
      </div>
      <div style={{ 
        color: 'var(--color-text-secondary)', 
        fontSize: '11px',
        minHeight: '16px',
        display: 'flex',
        alignItems: 'center',
        marginTop: '4px'
      }}>
        <span style={{ color: currentStateIndex === SIMULATION_STATES.length - 1 ? 'var(--color-success)' : 'inherit' }}>
          {SIMULATION_STATES[currentStateIndex]}
        </span>
        <span style={{ opacity: showCursor ? 1 : 0, marginLeft: '2px', color: 'var(--color-accent)' }}>_</span>
      </div>
    </div>
  );
}
