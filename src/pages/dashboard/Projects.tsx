import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Link, useLocation } from 'react-router-dom';
import { githubService } from '../../services/githubService';
import { RepositorySelection } from './RepositorySelection';
import { Plus, RefreshCw, Folder, Cloud } from 'lucide-react';

const MOCK_PROJECTS = [
  { id: '1', name: 'yashsachan2307-png/devpilot-frontend', description: 'React foundation for the copilot.', status: 'Active', updated: '2 hours ago', language: 'TypeScript' },
  { id: '2', name: 'yashsachan2307-png/devpilot-backend', description: 'Spring Boot backend services.', status: 'Indexing', updated: '1 day ago', language: 'Java' }
];

export function Projects() {
  const [githubConnected, setGithubConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showImportModal, setShowImportModal] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Check if we just connected from the callback
    if (location.state?.githubConnected) {
      setGithubConnected(true);
      setLoading(false);
      setShowImportModal(true);
      // Clean up state
      window.history.replaceState({}, document.title)
      return;
    }

    githubService.getStatus()
      .then(data => {
        setGithubConnected(data.connected);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.state]);

  const handleConnectGitHub = async () => {
    try {
      const url = await githubService.getConnectUrl();
      window.location.href = url;
    } catch (err) {
      alert('Failed to get GitHub connection URL');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="text-xl font-semibold text-primary">Repositories</h1>
          <p className="text-secondary text-sm mt-1">Manage your connected codebases and AI workspaces.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!loading && !githubConnected ? (
            <Button onClick={handleConnectGitHub} className="btn-secondary">
              <Cloud size={14} /> Connect GitHub
            </Button>
          ) : (
            <Button onClick={() => setShowImportModal(true)} className="btn-secondary">
              <Plus size={14} /> Import Repository
            </Button>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header" style={{ padding: '8px 16px', backgroundColor: 'var(--color-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input type="text" className="form-input" placeholder="Search repositories..." style={{ maxWidth: '300px', height: '24px', fontSize: '12px' }} />
          </div>
        </div>
        
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-secondary)', fontSize: '11px', textTransform: 'uppercase' }}>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Repository</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Language</th>
              <th style={{ padding: '12px 16px', fontWeight: 500 }}>Last Updated</th>
              <th style={{ padding: '12px 16px', fontWeight: 500, width: '100px' }}></th>
            </tr>
          </thead>
          <tbody>
            {MOCK_PROJECTS.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Folder size={16} className="text-accent" />
                    <div>
                      <Link to={`/dashboard/projects/${p.id}`} style={{ fontWeight: 500, color: 'var(--color-text-primary)' }}>
                        {p.name}
                      </Link>
                      <div className="text-xs text-muted" style={{ marginTop: '2px' }}>{p.description}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {p.status === 'Active' ? (
                    <span className="badge badge-success">Active</span>
                  ) : (
                    <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content' }}>
                      <RefreshCw size={10} className="animate-spin" /> Indexing
                    </span>
                  )}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                  {p.language}
                </td>
                <td style={{ padding: '12px 16px', color: 'var(--color-text-secondary)' }}>
                  {p.updated}
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <Link to={`/dashboard/projects/${p.id}`} className="btn btn-secondary btn-sm" style={{ width: '100%' }}>
                    Open
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showImportModal && (
        <RepositorySelection onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
