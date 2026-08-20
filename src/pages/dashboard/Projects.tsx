import { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Link, useLocation } from 'react-router-dom';
import { githubService } from '../../services/githubService';
import { RepositorySelection } from './RepositorySelection';
import { Plus, RefreshCw, FolderGit2, Cloud, TerminalSquare, GitBranch } from 'lucide-react';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', height: '100%' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexShrink: 0 }}>
        <div>
          <h1 className="text-xl font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FolderGit2 className="text-accent" size={20} />
            WORKSPACE_REPOSITORIES
          </h1>
          <p className="text-secondary text-sm mt-1" style={{ fontFamily: 'var(--font-code)' }}>Manage your connected codebases and AI workspaces.</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {!loading && !githubConnected ? (
            <Button onClick={handleConnectGitHub} className="btn-secondary" style={{ fontFamily: 'var(--font-code)' }}>
              <Cloud size={14} /> CONNECT_GITHUB
            </Button>
          ) : (
            <Button onClick={() => setShowImportModal(true)} className="btn-primary" style={{ fontFamily: 'var(--font-code)' }}>
              <Plus size={14} /> IMPORT_REPO
            </Button>
          )}
        </div>
      </div>

      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div className="card-header" style={{ padding: '12px 16px', backgroundColor: 'var(--color-bg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontFamily: 'var(--font-code)', fontSize: '11px' }}>
            <TerminalSquare size={12} />
            <span>LOCAL_INDEXED_PROJECTS</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <input 
              type="text" 
              className="form-input" 
              placeholder="Search repositories..." 
              style={{ width: '250px', height: '28px', fontSize: '11px', fontFamily: 'var(--font-code)', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }} 
            />
          </div>
        </div>
        
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left', fontFamily: 'var(--font-code)' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-muted)', fontSize: '10px', backgroundColor: 'var(--color-surface)' }}>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>REPOSITORY_NAME</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>STATUS</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>PRIMARY_LANG</th>
                <th style={{ padding: '12px 16px', fontWeight: 600 }}>LAST_SYNC</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, width: '100px', textAlign: 'right' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_PROJECTS.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--color-border)', transition: 'background-color 0.2s' }} className="hover:bg-[var(--color-surface)]">
                  <td style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                        <GitBranch size={16} className="text-accent" />
                      </div>
                      <div>
                        <Link to={`/dashboard/projects/${p.id}`} style={{ fontWeight: 600, color: 'var(--color-text-primary)', textDecoration: 'none' }} className="hover:text-accent">
                          {p.name}
                        </Link>
                        <div className="text-muted" style={{ marginTop: '4px', fontSize: '11px', fontFamily: 'var(--font-ui)' }}>{p.description}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    {p.status === 'Active' ? (
                      <span className="badge badge-success" style={{ fontFamily: 'var(--font-code)', fontSize: '10px' }}>[ACTIVE]</span>
                    ) : (
                      <span className="badge badge-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'fit-content', fontFamily: 'var(--font-code)', fontSize: '10px' }}>
                        <RefreshCw size={10} className="animate-spin" /> [INDEXING]
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-secondary)' }}>
                    {p.language}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--color-text-muted)', fontSize: '11px' }}>
                    {p.updated}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    <Link to={`/dashboard/projects/${p.id}`} className="btn btn-secondary btn-sm" style={{ fontFamily: 'var(--font-code)', fontSize: '10px' }}>
                      OPEN_WORKSPACE
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showImportModal && (
        <RepositorySelection onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
