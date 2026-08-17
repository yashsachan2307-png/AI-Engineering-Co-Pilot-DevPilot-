import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CodeQualityDashboard } from './components/CodeQualityDashboard';
import { FolderGit2, ArrowRight, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

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
      const res = await fetch('http://localhost:8080/api/repositories', {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Header bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h1 className="text-xl font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShieldCheck className="text-accent" size={20} />
            Static Code Analyzer
          </h1>
          <p className="text-secondary text-sm mt-1">
            Deterministic analysis, complexity hotspots, and code smell detection
          </p>
        </div>

        {repositories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)' }}>
            <FolderGit2 size={14} className="text-muted" />
            <select
              value={selectedRepoId}
              onChange={e => setSelectedRepoId(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {repositories.map(r => (
                <option key={r.id} value={String(r.id)} style={{ background: 'var(--color-surface)' }}>
                  {r.name} ({r.language || 'Code'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Container */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '13px' }}>
          Loading repositories...
        </div>
      ) : repositories.length === 0 ? (
        <div className="card" style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center', padding: '32px' }}>
          <FolderGit2 size={32} className="text-accent" style={{ margin: '0 auto 16px' }} />
          <h3 className="text-primary font-semibold text-lg mb-2">No Repositories Found</h3>
          <p className="text-secondary text-sm mb-6">
            Connect your GitHub account or import a repository to begin running static quality analysis and complexity checks.
          </p>
          <Link to="/dashboard/projects" style={{ display: 'block' }}>
            <Button className="btn-primary w-full justify-center">
              Go to Projects <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
          <CodeQualityDashboard repositoryId={selectedRepoId} />
        </div>
      )}
    </div>
  );
}
