import React, { useState, useEffect } from 'react';
import { githubService, GitHubRepository } from '../../services/githubService';

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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-[var(--border)] flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Import Repository</h2>
            <p className="text-[var(--text-secondary)] text-sm">Select a repository from your GitHub account</p>
          </div>
          <button onClick={onClose} className="text-[var(--text-secondary)] hover:text-white transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        <div className="p-6 flex-1 overflow-hidden flex flex-col">
          {error && <div className="text-red-500 mb-4">{error}</div>}
          
          <input 
            type="text" 
            placeholder="Search repositories..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-4 py-2 mb-4 text-white focus:outline-none focus:border-[var(--accent-primary)]"
          />

          <div className="overflow-y-auto flex-1 pr-2 space-y-2">
            {loading ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">Loading repositories...</div>
            ) : filteredRepos.length === 0 ? (
              <div className="text-center py-8 text-[var(--text-secondary)]">No repositories found.</div>
            ) : (
              filteredRepos.map(repo => (
                <div key={repo.id} className="flex justify-between items-center p-4 border border-[var(--border)] rounded-lg hover:border-[var(--border-hover)] transition-colors">
                  <div className="overflow-hidden">
                    <div className="font-medium flex items-center gap-2">
                      <span className="truncate">{repo.full_name}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--bg-hover)] text-[var(--text-secondary)] border border-[var(--border)]">
                        {repo.visibility}
                      </span>
                    </div>
                    {repo.description && <p className="text-sm text-[var(--text-secondary)] truncate mt-1">{repo.description}</p>}
                    <div className="text-xs text-[var(--text-secondary)] flex gap-4 mt-2">
                      {repo.language && <span>{repo.language}</span>}
                      <span>Updated {new Date(repo.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => handleImport(repo.id)}
                    disabled={importing === repo.id}
                    className="ml-4 px-4 py-2 bg-[var(--bg-hover)] text-white text-sm font-medium rounded-lg border border-[var(--border)] hover:bg-[var(--accent-primary)] hover:border-transparent transition-all disabled:opacity-50"
                  >
                    {importing === repo.id ? 'Importing...' : 'Import'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
