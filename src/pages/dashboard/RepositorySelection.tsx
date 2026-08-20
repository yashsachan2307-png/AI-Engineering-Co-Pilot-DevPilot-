import React, { useState, useEffect } from 'react';
import { githubService, GitHubRepository } from '../../services/githubService';
import { Search, X, FolderGit2, Download } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const RepositorySelection: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [importing, setImporting] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    githubService.getRepositories()
      .then(data => {
        setRepositories(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to fetch repositories');
        setLoading(false);
      });
  }, []);

  const handleImport = async (id: number) => {
    setImporting(id);
    try {
      await githubService.importRepository(id);
      alert('Repository imported successfully!');
      onClose();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to import repository');
      setImporting(null);
    }
  };

  const filteredRepos = repositories.filter(repo => 
    repo.name.toLowerCase().includes(search.toLowerCase()) || 
    (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
      <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', width: '100%', maxWidth: '800px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', boxShadow: '0 20px 40px rgba(0,0,0,0.5)' }}>
        
        {/* Header */}
        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'var(--color-bg)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <FolderGit2 size={18} style={{ color: 'var(--color-accent)' }} />
            <div>
              <h2 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>IMPORT_REPOSITORY</h2>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', fontFamily: 'var(--font-code)' }}>Select a repository from your GitHub account</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ background: 'transparent', border: 'none', color: 'var(--color-text-secondary)', cursor: 'pointer', padding: '4px' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px', flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          {error && <div style={{ color: 'var(--color-error)', backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: 'var(--radius-sm)', fontSize: '12px', fontFamily: 'var(--font-code)', marginBottom: '16px' }}>[ERROR]: {error}</div>}
          
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search size={14} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search repositories..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '10px 12px 10px 36px', color: 'var(--color-text-primary)', fontSize: '12px', fontFamily: 'var(--font-code)', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>
                [LOADING_REPOSITORIES...]
              </div>
            ) : filteredRepos.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-secondary)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>
                [NO_REPOSITORIES_FOUND]
              </div>
            ) : (
              filteredRepos.map(repo => (
                <div key={repo.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)' }}>
                  <div style={{ overflow: 'hidden', flex: 1, paddingRight: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{repo.full_name}</span>
                      <span style={{ fontSize: '10px', padding: '2px 6px', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)', textTransform: 'uppercase', fontFamily: 'var(--font-code)' }}>
                        {repo.visibility}
                      </span>
                    </div>
                    {repo.description && <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '8px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', fontFamily: 'var(--font-code)' }}>{repo.description}</p>}
                    <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)', textTransform: 'uppercase' }}>
                      {repo.language && <span>LANG: {repo.language}</span>}
                      <span>UPDATED: {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <Button 
                    onClick={() => handleImport(repo.id)}
                    disabled={importing === repo.id}
                    className="btn-primary"
                    style={{ fontSize: '11px', fontFamily: 'var(--font-code)', padding: '6px 12px', flexShrink: 0 }}
                  >
                    {importing === repo.id ? '[IMPORTING...]' : <><Download size={12} style={{ marginRight: '6px' }} /> IMPORT</>}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
