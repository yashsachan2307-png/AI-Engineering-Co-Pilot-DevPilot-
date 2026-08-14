import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { CodeQualityDashboard } from './components/CodeQualityDashboard';
import { FolderGit2, ArrowRight } from 'lucide-react';

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
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>Static Code Analyzer</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Run deterministic static analysis rules, detect complexity hotspots, code smells, and coupling issues.
          </p>
        </div>

        {repositories.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Repository:</label>
            <select
              value={selectedRepoId}
              onChange={e => setSelectedRepoId(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                border: '1px solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              {repositories.map(r => (
                <option key={r.id} value={String(r.id)}>
                  {r.name} ({r.language || 'Code'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Main Container */}
      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
          Loading repositories...
        </div>
      ) : repositories.length === 0 ? (
        <div style={{ 
          flex: 1, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center',
          backgroundColor: 'var(--color-surface)',
          borderRadius: '12px',
          border: '1px solid var(--color-border)',
          padding: '40px',
          textAlign: 'center'
        }}>
          <FolderGit2 size={48} color="var(--color-primary)" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Imported Repositories Found</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '440px', marginBottom: '20px' }}>
            Connect your GitHub account or import a repository to begin running static quality analysis and complexity checks.
          </p>
          <a
            href="/dashboard/projects"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              borderRadius: '6px',
              textDecoration: 'none',
              fontWeight: 500,
              fontSize: '0.9rem'
            }}
          >
            Go to Projects <ArrowRight size={16} />
          </a>
        </div>
      ) : (
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <CodeQualityDashboard repositoryId={selectedRepoId} />
        </div>
      )}
    </div>
  );
}
