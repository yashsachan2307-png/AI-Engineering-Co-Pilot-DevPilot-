import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { debuggerService, DebugRequest, DebugResponse } from '../../services/debuggerService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  FolderGit2, 
  Bug, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  FileCode2,
  ShieldAlert,
  Lightbulb
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Repo {
  id: number;
  name: string;
  fullName: string;
}

export function Debugger() {
  const { token } = useAuth();
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [stackTrace, setStackTrace] = useState('');
  const [userDescription, setUserDescription] = useState('');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<DebugResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  const fetchRepositories = async () => {
    try {
      const res = await fetch('/api/repositories', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (res.ok) {
        const data = await res.json();
        setRepositories(data);
        if (data.length > 0 && !selectedRepoId) setSelectedRepoId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load repositories', e);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedRepoId || !errorMessage.trim()) return;

    setIsAnalyzing(true);
    setResult(null);
    setError(null);

    const request: DebugRequest = {
      errorMessage,
      stackTrace,
      userDescription
    };

    try {
      const response = await debuggerService.debugError(selectedRepoId, request, token || undefined);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to analyze error');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bug size={24} style={{ color: 'var(--color-accent)' }} />
            Repository-Aware AI Debugger
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Paste your stack trace and let AI diagnose the root cause using repository context.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--color-bg-secondary)', padding: '0.35rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)' }}>
          <FolderGit2 size={16} style={{ color: 'var(--color-text-secondary)' }} />
          <select
            value={selectedRepoId || ''}
            onChange={(e) => setSelectedRepoId(Number(e.target.value))}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text)',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            {repositories.length === 0 && <option value="">No repositories imported</option>}
            {repositories.map(r => (
              <option key={r.id} value={r.id} style={{ background: 'var(--color-bg)', color: 'var(--color-text)' }}>
                {r.fullName || r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Inputs */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card>
            <CardHeader>
              <CardTitle>Error Details</CardTitle>
              <CardDescription>Provide the error message and stack trace to begin.</CardDescription>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Error Message (Required)</label>
                <input 
                  type="text" 
                  value={errorMessage}
                  onChange={e => setErrorMessage(e.target.value)}
                  placeholder="e.g. NullPointerException in UserService.java"
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Stack Trace</label>
                <textarea 
                  value={stackTrace}
                  onChange={e => setStackTrace(e.target.value)}
                  placeholder="Paste the full stack trace here..."
                  rows={8}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontFamily: 'monospace', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Context or Steps to Reproduce (Optional)</label>
                <textarea 
                  value={userDescription}
                  onChange={e => setUserDescription(e.target.value)}
                  placeholder="What were you trying to do when this happened?"
                  rows={3}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.875rem' }}
                />
              </div>

              <Button 
                variant="accent" 
                onClick={handleAnalyze} 
                disabled={!selectedRepoId || !errorMessage.trim() || isAnalyzing}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
              >
                {isAnalyzing ? (
                  <><RefreshCw size={16} className="animate-spin" /> Analyzing Repository Context...</>
                ) : (
                  <><Bug size={16} /> Analyze Error</>
                )}
              </Button>

              {error && (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Results */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!result && !isAnalyzing && (
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: 'var(--color-bg-secondary)', borderStyle: 'dashed' }}>
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Bug size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Submit an error to view the AI diagnosis here.</p>
              </div>
            </Card>
          )}

          {isAnalyzing && (
            <Card style={{ height: '100%', minHeight: '400px' }}>
              <CardContent style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                <p style={{ fontWeight: 600 }}>Gathering Context & Diagnosing...</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '80%' }}>
                  Searching codebase for related files, analyzing stack trace elements, and generating fix recommendations.
                </p>
              </CardContent>
            </Card>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Card style={{ borderColor: 'var(--color-danger, #ef4444)' }}>
                <CardHeader style={{ paddingBottom: '0.5rem' }}>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-danger, #ef4444)' }}>
                    <AlertTriangle size={18} /> Root Cause Diagnosis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ fontWeight: 600, marginBottom: '0.5rem' }}>{result.rootCause}</p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>{result.evidence}</p>
                </CardContent>
              </Card>

              {result.suggestedFix && (
                <Card style={{ borderColor: 'var(--color-success, #10b981)' }}>
                  <CardHeader style={{ paddingBottom: '0.5rem' }}>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success, #10b981)' }}>
                      <CheckCircle2 size={18} /> Suggested Fix
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-sm dark:prose-invert" style={{ fontSize: '0.875rem' }}>
                      <SyntaxHighlighter language="markdown" style={vscDarkPlus} className="rounded-md text-sm">
                        {result.suggestedFix}
                      </SyntaxHighlighter>
                    </div>
                  </CardContent>
                </Card>
              )}

              {result.relevantFiles && result.relevantFiles.length > 0 && (
                <Card>
                  <CardHeader style={{ paddingBottom: '0.5rem' }}>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                      <FileCode2 size={16} /> Relevant Files
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
                      {result.relevantFiles.map((file, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}><code>{file}</code></li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {(result.likelyCauses && result.likelyCauses.length > 0) && (
                <Card>
                  <CardHeader style={{ paddingBottom: '0.5rem' }}>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                      <Lightbulb size={16} /> Possible Causes
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul style={{ margin: 0, paddingLeft: '1.25rem', fontSize: '0.875rem' }}>
                      {result.likelyCauses.map((cause, idx) => (
                        <li key={idx} style={{ marginBottom: '0.25rem' }}>{cause}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {(result.potentialSideEffects || result.prevention) && (
                <Card>
                  <CardHeader style={{ paddingBottom: '0.5rem' }}>
                    <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                      <ShieldAlert size={16} /> Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
                    {result.potentialSideEffects && (
                      <div>
                        <strong>Potential Side Effects:</strong>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{result.potentialSideEffects}</p>
                      </div>
                    )}
                    {result.prevention && (
                      <div>
                        <strong>Prevention:</strong>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>{result.prevention}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
