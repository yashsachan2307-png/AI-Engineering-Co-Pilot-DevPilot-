import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link, useLocation } from 'react-router-dom';
import { githubService } from '../../services/githubService';
import { RepositorySelection } from './RepositorySelection';

const MOCK_PROJECTS = [
  { id: '1', name: 'devpilot-frontend', description: 'React foundation for the copilot.', status: 'Active' },
  { id: '2', name: 'devpilot-backend', description: 'Spring Boot backend services.', status: 'Planning' }
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <div className="flex gap-4">
          {!loading && !githubConnected ? (
            <Button onClick={handleConnectGitHub} variant="outline" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
              Connect GitHub
            </Button>
          ) : (
            <Button onClick={() => setShowImportModal(true)} variant="outline" className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
              Import Repository
            </Button>
          )}
          <Button variant="accent">New Project</Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {MOCK_PROJECTS.map(p => (
          <Card key={p.id}>
            <div className="flex justify-between items-center pr-6">
              <CardHeader>
                <CardTitle>
                  <Link to={`/dashboard/projects/${p.id}`} className="no-underline text-[var(--text-primary)] hover:text-[var(--accent-primary)] transition-colors">
                    {p.name}
                  </Link>
                </CardTitle>
                <CardDescription>{p.description}</CardDescription>
              </CardHeader>
              <Badge variant={p.status === 'Active' ? 'success' : 'default'}>{p.status}</Badge>
            </div>
          </Card>
        ))}
      </div>

      {showImportModal && (
        <RepositorySelection onClose={() => setShowImportModal(false)} />
      )}
    </div>
  );
}
