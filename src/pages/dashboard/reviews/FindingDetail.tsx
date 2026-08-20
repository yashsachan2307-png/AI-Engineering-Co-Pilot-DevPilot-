import React, { useState } from 'react';
import { ReviewFinding } from '../../../services/reviewService';
import { Button } from '../../../components/ui/Button';

interface FindingDetailProps {
  finding: ReviewFinding;
  onUpdateStatus: (findingId: number, status: 'PENDING' | 'REVIEWED' | 'DISMISSED') => void;
}

export const FindingDetail: React.FC<FindingDetailProps> = ({ finding, onUpdateStatus }) => {
  const [updating, setUpdating] = useState(false);

  const handleStatusChange = async (status: 'REVIEWED' | 'DISMISSED') => {
    setUpdating(true);
    try {
      await onUpdateStatus(finding.id, status);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '24px', position: 'sticky', top: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>{finding.title}</h3>
        <span style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', padding: '4px 12px', borderRadius: '16px', fontSize: '11px', fontWeight: 600, border: '1px solid var(--color-border)', fontFamily: 'var(--font-code)' }}>
          {finding.category}
        </span>
      </div>
      
      <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', lineHeight: 1.6, marginBottom: '24px', fontFamily: 'var(--font-code)' }}>{finding.description}</p>
      
      {finding.evidence && (
        <div style={{ marginBottom: '24px' }}>
          <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)', textTransform: 'uppercase' }}>EVIDENCE_/_SNIPPET</h4>
          <pre style={{ backgroundColor: 'var(--color-bg)', padding: '16px', borderRadius: 'var(--radius-sm)', fontSize: '12px', color: 'var(--color-text-primary)', overflowX: 'auto', border: '1px solid var(--color-border)', fontFamily: 'var(--font-code)' }}>
            <code>{finding.evidence}</code>
          </pre>
        </div>
      )}

      <div style={{ marginBottom: '24px' }}>
        <h4 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)', textTransform: 'uppercase' }}>RECOMMENDATION</h4>
        <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', padding: '16px', borderRadius: 'var(--radius-sm)', color: 'var(--color-text-primary)', fontSize: '13px', fontFamily: 'var(--font-code)' }}>
          {finding.recommendation}
        </div>
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
        <span style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginRight: 'auto', fontFamily: 'var(--font-code)' }}>STATUS: <strong style={{ color: 'var(--color-text-primary)' }}>[{finding.status}]</strong></span>
        {finding.status !== 'REVIEWED' && (
          <Button 
            disabled={updating}
            onClick={() => handleStatusChange('REVIEWED')}
            style={{ padding: '8px 16px', fontSize: '11px', fontFamily: 'var(--font-code)', backgroundColor: 'var(--color-success)', color: '#000', border: 'none' }}
          >
            MARK_AS_FIXED
          </Button>
        )}
        {finding.status !== 'DISMISSED' && (
          <Button 
            disabled={updating}
            onClick={() => handleStatusChange('DISMISSED')}
            className="btn-secondary"
            style={{ padding: '8px 16px', fontSize: '11px', fontFamily: 'var(--font-code)' }}
          >
            DISMISS
          </Button>
        )}
      </div>
    </div>
  );
};
