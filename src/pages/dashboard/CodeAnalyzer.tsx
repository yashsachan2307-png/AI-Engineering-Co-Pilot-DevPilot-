import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CodeQualityDashboard } from './components/CodeQualityDashboard';
import { FolderGit2, ArrowRight, ShieldCheck, TerminalSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { API_BASE_URL } from '../../services/api';

interface Repo {
  id: number;
  name: string;
  owner: string;
  language: string;
  description: string;
}

export function CodeAnalyzer() {
  const { token } = useAuth();
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepositories();
  }, [token]);

  const fetchRepositories = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRepositories(data);
        if (data.length > 0) {
          setSelectedRepoId(String(data[0].id));
        }
      }
    } catch (err) {
      console.error('Failed to fetch repositories', err);
    } finally {
      setLoading(false);
    }
  };

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
            <TerminalSquare size={16} />
            <span>STATIC_ANALYSIS_ENGINE</span>
          </div>
          
          <div style={{ height: 16, width: 1, backgroundColor: 'var(--color-border)' }} />
          
          {repositories.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)' }}>
              <FolderGit2 size={12} className="text-muted" />
              <select
                value={selectedRepoId}
                onChange={e => setSelectedRepoId(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-primary)',
                  fontFamily: 'var(--font-code)',
                  fontSize: '11px',
                  outline: 'none',
                  cursor: 'pointer',
                  width: '180px',
                  textOverflow: 'ellipsis'
                }}
              >
                {repositories.map(r => (
                  <option key={r.id} value={String(r.id)} style={{ background: 'var(--color-surface)' }}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px', fontFamily: 'var(--font-code)' }}>
          LOADING_WORKSPACE_INDEX...
        </div>
      ) : repositories.length === 0 ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', minWidth: '350px' }}>
            <FolderGit2 size={32} className="text-muted" />
            <div style={{ textAlign: 'center', fontFamily: 'var(--font-code)' }}>
              <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>NO_REPOSITORIES_FOUND</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>Connect GitHub account or import repository<br/>to run static analysis.</div>
            </div>
            <Link to="/dashboard/projects" style={{ width: '100%' }}>
              <Button className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-code)', fontSize: '11px' }}>
                OPEN_PROJECTS <ArrowRight size={12} className="ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <CodeQualityDashboard repositoryId={selectedRepoId} />
        </div>
      )}
    </div>
  );
}
