import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { githubService } from '../../services/githubService';

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
    <div className="flex flex-col items-center justify-center h-full">
      {error ? (
        <div className="text-red-500 mb-4">
          <h2 className="text-xl font-bold mb-2">Connection Failed</h2>
          <p>{error}</p>
          <button 
            onClick={() => navigate('/dashboard/projects')}
            className="mt-4 px-4 py-2 bg-[var(--accent-primary)] text-white rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            Return to Projects
          </button>
        </div>
      ) : (
        <div className="text-[var(--text-primary)] text-center">
          <div className="w-12 h-12 border-4 border-[var(--accent-primary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Connecting your GitHub account...</h2>
          <p className="text-[var(--text-secondary)] mt-2">Please wait while we securely complete the integration.</p>
        </div>
      )}
    </div>
  );
};
