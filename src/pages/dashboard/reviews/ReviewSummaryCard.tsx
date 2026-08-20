import React from 'react';

interface ReviewSummaryCardProps {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export const ReviewSummaryCard: React.FC<ReviewSummaryCardProps> = ({ critical, high, medium, low }) => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
      <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
        <h4 style={{ color: 'var(--color-error)', fontSize: '11px', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--font-code)', textTransform: 'uppercase' }}>CRITICAL</h4>
        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-error)', fontFamily: 'var(--font-code)' }}>{critical}</span>
      </div>
      <div style={{ backgroundColor: 'rgba(245, 158, 11, 0.1)', border: '1px solid var(--color-warning)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
        <h4 style={{ color: 'var(--color-warning)', fontSize: '11px', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--font-code)', textTransform: 'uppercase' }}>HIGH</h4>
        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-warning)', fontFamily: 'var(--font-code)' }}>{high}</span>
      </div>
      <div style={{ backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid var(--color-accent)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
        <h4 style={{ color: 'var(--color-accent)', fontSize: '11px', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--font-code)', textTransform: 'uppercase' }}>MEDIUM</h4>
        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-accent)', fontFamily: 'var(--font-code)' }}>{medium}</span>
      </div>
      <div style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)', borderRadius: 'var(--radius-sm)', padding: '16px', textAlign: 'center' }}>
        <h4 style={{ color: 'var(--color-success)', fontSize: '11px', fontWeight: 600, marginBottom: '4px', fontFamily: 'var(--font-code)', textTransform: 'uppercase' }}>LOW</h4>
        <span style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-success)', fontFamily: 'var(--font-code)' }}>{low}</span>
      </div>
    </div>
  );
};
