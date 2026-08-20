import React from 'react';
import { ReviewFinding } from '../../../services/reviewService';

interface FindingListProps {
  findings: ReviewFinding[];
  selectedFindingId: number | null;
  onSelect: (finding: ReviewFinding) => void;
}

export const FindingList: React.FC<FindingListProps> = ({ findings, selectedFindingId, onSelect }) => {
  if (findings.length === 0) {
    return <div style={{ color: 'var(--color-text-secondary)', textAlign: 'center', padding: '16px', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-sm)', fontFamily: 'var(--font-code)', fontSize: '12px' }}>[NO_FINDINGS_AVAILABLE]</div>;
  }

  const getSeverityColor = (sev: string) => {
    switch(sev) {
      case 'CRITICAL': return 'var(--color-error)';
      case 'HIGH': return 'var(--color-warning)';
      case 'MEDIUM': return 'var(--color-accent)';
      default: return 'var(--color-success)';
    }
  };

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', overflow: 'hidden' }}>
      {findings.map((finding, index) => (
        <div 
          key={finding.id} 
          style={{ 
            padding: '16px', 
            cursor: 'pointer', 
            borderBottom: index < findings.length - 1 ? '1px solid var(--color-border)' : 'none',
            backgroundColor: selectedFindingId === finding.id ? 'var(--color-bg)' : 'transparent',
            borderLeft: selectedFindingId === finding.id ? '3px solid var(--color-accent)' : '3px solid transparent'
          }}
          onClick={() => onSelect(finding)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, paddingRight: '16px', fontFamily: 'var(--font-code)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{finding.title}</h4>
            <span style={{ 
              padding: '2px 6px', 
              fontSize: '10px', 
              fontWeight: 600, 
              borderRadius: 'var(--radius-sm)', 
              backgroundColor: 'var(--color-bg)',
              color: getSeverityColor(finding.severity),
              border: `1px solid ${getSeverityColor(finding.severity)}`,
              fontFamily: 'var(--font-code)'
            }}>
              {finding.severity}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '11px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>
            <span style={{ backgroundColor: 'var(--color-bg)', padding: '2px 6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>{finding.category}</span>
            <span>
              {finding.file} {finding.startLine ? `(L${finding.startLine})` : ''}
            </span>
            {finding.status !== 'PENDING' && (
              <span style={{ fontWeight: 600, color: finding.status === 'REVIEWED' ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
                [{finding.status}]
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
