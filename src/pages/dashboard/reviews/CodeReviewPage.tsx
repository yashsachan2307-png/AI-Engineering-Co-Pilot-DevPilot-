import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ReviewSummary, ReviewFinding, reviewService } from '../../../services/reviewService';
import { ReviewSummaryCard } from './ReviewSummaryCard';
import { FindingList } from './FindingList';
import { FindingDetail } from './FindingDetail';
import { Button } from '../../../components/ui/Button';

export const CodeReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  
  const [fileOrContext, setFileOrContext] = useState('');
  const [codeSnippet, setCodeSnippet] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ReviewSummary | null>(null);
  const [selectedFinding, setSelectedFinding] = useState<ReviewFinding | null>(null);
  const [error, setError] = useState('');

  const handleStartReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !fileOrContext.trim()) return;
    
    setLoading(true);
    setError('');
    setSummary(null);
    setSelectedFinding(null);
    
    try {
      const result = await reviewService.createReview(id, fileOrContext, codeSnippet);
      setSummary(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate code review');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (findingId: number, status: 'PENDING' | 'REVIEWED' | 'DISMISSED') => {
    try {
      const updated = await reviewService.updateFindingStatus(findingId, status);
      // Update local state
      if (summary) {
        setSummary({
          ...summary,
          findings: summary.findings.map(f => f.id === findingId ? updated : f)
        });
      }
      if (selectedFinding?.id === findingId) {
        setSelectedFinding(updated);
      }
    } catch (err) {
      console.error('Failed to update finding', err);
    }
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '32px 16px', fontFamily: 'var(--font-ui)' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>AI_CODE_REVIEW</h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '13px', fontFamily: 'var(--font-code)' }}>Analyze your code using deterministic tools and LLM context to get precise findings.</p>
      </div>

      {!summary && !loading && (
        <form onSubmit={handleStartReview} style={{ backgroundColor: 'var(--color-surface)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', maxWidth: '800px' }}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px', fontFamily: 'var(--font-code)' }}>FILE_NAME_OR_CONTEXT</label>
            <input 
              type="text" 
              required
              value={fileOrContext}
              onChange={e => setFileOrContext(e.target.value)}
              placeholder="e.g. src/main/java/AuthService.java"
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '6px', fontFamily: 'var(--font-code)' }}>CODE_SNIPPET_(OPTIONAL)</label>
            <textarea 
              rows={10}
              value={codeSnippet}
              onChange={e => setCodeSnippet(e.target.value)}
              placeholder="Paste your code here..."
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
            />
          </div>
          
          {error && <div style={{ marginBottom: '16px', color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(239, 68, 68, 0.2)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>[ERROR]: {error}</div>}

          <Button 
            type="submit"
            className="btn-primary"
            style={{ width: '100%', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-code)' }}
          >
            EXECUTE_REVIEW
          </Button>
        </form>
      )}

      {loading && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
          <div style={{ width: '48px', height: '48px', border: '3px solid var(--color-bg)', borderTopColor: 'var(--color-accent)', borderRadius: '50%', marginBottom: '16px', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '12px', fontFamily: 'var(--font-code)', letterSpacing: '1px' }}>[RUNNING_STATIC_ANALYSIS_AND_LLM_REVIEW...]</p>
        </div>
      )}

      {summary && !loading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }}>REVIEW_RESULTS</h2>
            <button 
              onClick={() => { setSummary(null); setFileOrContext(''); setCodeSnippet(''); }}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-accent)', fontSize: '12px', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-code)', padding: 0 }}
            >
              START_NEW_REVIEW
            </button>
          </div>
          
          <ReviewSummaryCard 
            critical={summary.criticalCount}
            high={summary.highCount}
            medium={summary.mediumCount}
            low={summary.lowCount}
          />
          
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 2fr)', gap: '32px' }}>
            <div>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: '12px', fontFamily: 'var(--font-code)' }}>FINDINGS ({summary.findings.length})</h3>
              <FindingList 
                findings={summary.findings} 
                selectedFindingId={selectedFinding?.id || null}
                onSelect={setSelectedFinding}
              />
            </div>
            <div>
              {selectedFinding ? (
                <FindingDetail finding={selectedFinding} onUpdateStatus={handleUpdateStatus} />
              ) : (
                <div style={{ backgroundColor: 'var(--color-bg)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', padding: '48px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>
                  [SELECT_A_FINDING_TO_VIEW_DETAILS]
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
