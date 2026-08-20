import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { githubService } from '../../services/githubService';
import { TerminalSquare, RefreshCw, XCircle } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const GitHubCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get('code');
    
    if (code) {
      githubService.handleCallback(code)
        .then(() => {
          navigate('/dashboard/projects', { state: { githubConnected: true } });
        })
        .catch((err) => {
          setError(err.response?.data?.error || err.message || 'Failed to connect GitHub account');
        });
    } else {
      setError('No authorization code found');
    }
  }, [searchParams, navigate]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: 'var(--color-bg)', fontFamily: 'var(--font-ui)' }}>
      {error ? (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-error)', borderRadius: 'var(--radius-md)', padding: '32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <XCircle size={48} style={{ color: 'var(--color-error)', margin: '0 auto 16px auto' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-error)', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>CONNECTION_FAILED</h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginBottom: '24px', fontFamily: 'var(--font-code)' }}>{error}</p>
          <Button 
            onClick={() => navigate('/dashboard/projects')}
            className="btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-code)' }}
          >
            RETURN_TO_WORKSPACE
          </Button>
        </div>
      ) : (
        <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '48px 32px', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <RefreshCw size={48} className="animate-spin" style={{ color: 'var(--color-accent)', margin: '0 auto 24px auto' }} />
          <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px', fontFamily: 'var(--font-code)' }}>AUTHENTICATING_GITHUB...</h2>
          <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)' }}>Please wait while we securely complete the integration.</p>
        </div>
      )}
    </div>
  );
};
