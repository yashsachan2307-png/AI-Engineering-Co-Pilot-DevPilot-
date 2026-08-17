import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { debuggerService, DebugRequest, DebugResponse } from '../../services/debuggerService';
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
    <div className="flex flex-col gap-4 h-full bg-bg overflow-hidden">
      <div className="panel border-b-0 border-l-0 border-r-0 rounded-none flex justify-between items-center px-4 py-3 shrink-0 bg-surface">
        <div>
          <h1 className="text-sm font-semibold text-primary flex items-center gap-2 m-0">
            <Bug size={16} className="text-accent" />
            Repository-Aware AI Debugger
          </h1>
          <p className="text-xs text-secondary mt-1 m-0">
            Paste your stack trace and let AI diagnose the root cause using repository context.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1 bg-surface-hover border border-border rounded-sm">
          <FolderGit2 size={14} className="text-muted" />
          <select
            value={selectedRepoId || ''}
            onChange={(e) => setSelectedRepoId(Number(e.target.value))}
            className="select text-xs py-0.5 border-none bg-transparent pl-0 focus:ring-0 w-48"
          >
            {repositories.length === 0 && <option value="">No repositories imported</option>}
            {repositories.map(r => (
              <option key={r.id} value={r.id} className="bg-surface text-primary">
                {r.fullName || r.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Left Column: Inputs */}
        <div className="panel w-1/2 flex flex-col shrink-0 bg-surface border-l-0 border-r border-t border-b-0 rounded-none">
          <div className="px-4 py-3 border-b border-border bg-surface-hover">
            <h2 className="text-sm font-semibold text-primary m-0">Error Details</h2>
            <p className="text-xs text-secondary m-0 mt-0.5">Provide the error message and stack trace to begin.</p>
          </div>
          <div className="flex flex-col gap-4 p-4 overflow-y-auto">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Error Message (Required)</label>
              <input 
                type="text" 
                value={errorMessage}
                onChange={e => setErrorMessage(e.target.value)}
                placeholder="e.g. NullPointerException in UserService.java"
                className="input text-xs"
              />
            </div>

            <div className="flex flex-col gap-1.5 flex-1 min-h-[200px]">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Stack Trace</label>
              <textarea 
                value={stackTrace}
                onChange={e => setStackTrace(e.target.value)}
                placeholder="Paste the full stack trace here..."
                className="input flex-1 font-mono text-[11px] resize-none whitespace-pre"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-secondary uppercase tracking-wider">Context or Steps to Reproduce (Optional)</label>
              <textarea 
                value={userDescription}
                onChange={e => setUserDescription(e.target.value)}
                placeholder="What were you trying to do when this happened?"
                rows={3}
                className="input text-xs resize-none"
              />
            </div>

            <Button 
              className="btn-primary w-full justify-center text-xs py-2 mt-2"
              onClick={handleAnalyze} 
              disabled={!selectedRepoId || !errorMessage.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <><RefreshCw size={14} className="animate-spin mr-2" /> Analyzing Repository Context...</>
              ) : (
                <><Bug size={14} className="mr-2" /> Analyze Error</>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-error/10 text-error border border-error/30 rounded text-xs mt-2">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results */}
        <div className="flex-1 overflow-y-auto pr-4 pb-4">
          {!result && !isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-surface/50 min-h-[400px]">
              <Bug size={48} className="opacity-30 mb-4" />
              <p className="text-sm">Submit an error to view the AI diagnosis here.</p>
            </div>
          )}

          {isAnalyzing && (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
              <RefreshCw size={32} className="text-accent animate-spin mb-4" />
              <p className="text-sm font-semibold text-primary">Gathering Context & Diagnosing...</p>
              <p className="text-xs text-secondary text-center max-w-sm mt-2">
                Searching codebase for related files, analyzing stack trace elements, and generating fix recommendations.
              </p>
            </div>
          )}

          {result && (
            <div className="flex flex-col gap-4">
              <div className="panel border-l-4 border-error/70">
                <div className="px-4 py-2.5 border-b border-border bg-error/5 flex items-center gap-2">
                  <AlertTriangle size={14} className="text-error" />
                  <h3 className="text-sm font-semibold text-error m-0">Root Cause Diagnosis</h3>
                </div>
                <div className="p-4 bg-surface">
                  <p className="text-sm font-medium text-primary mb-2 leading-relaxed">{result.rootCause}</p>
                  <p className="text-xs text-secondary leading-relaxed">{result.evidence}</p>
                </div>
              </div>

              {result.suggestedFix && (
                <div className="panel border-l-4 border-success/70">
                  <div className="px-4 py-2.5 border-b border-border bg-success/5 flex items-center gap-2">
                    <CheckCircle2 size={14} className="text-success" />
                    <h3 className="text-sm font-semibold text-success m-0">Suggested Fix</h3>
                  </div>
                  <div className="p-4 bg-surface">
                    <div className="text-xs rounded overflow-hidden border border-border">
                      <SyntaxHighlighter language="markdown" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: '11px', padding: '12px' }}>
                        {result.suggestedFix}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              )}

              {result.relevantFiles && result.relevantFiles.length > 0 && (
                <div className="panel">
                  <div className="px-4 py-2.5 border-b border-border bg-surface-hover flex items-center gap-2">
                    <FileCode2 size={14} className="text-muted" />
                    <h3 className="text-sm font-semibold text-primary m-0">Relevant Files</h3>
                  </div>
                  <div className="p-3 bg-surface">
                    <ul className="m-0 pl-5 text-xs text-secondary font-mono space-y-1">
                      {result.relevantFiles.map((file, idx) => (
                        <li key={idx}><code className="text-primary">{file}</code></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {(result.likelyCauses && result.likelyCauses.length > 0) && (
                <div className="panel">
                  <div className="px-4 py-2.5 border-b border-border bg-surface-hover flex items-center gap-2">
                    <Lightbulb size={14} className="text-warning" />
                    <h3 className="text-sm font-semibold text-primary m-0">Possible Causes</h3>
                  </div>
                  <div className="p-4 bg-surface">
                    <ul className="m-0 pl-5 text-xs text-secondary space-y-1.5 leading-relaxed">
                      {result.likelyCauses.map((cause, idx) => (
                        <li key={idx}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {(result.potentialSideEffects || result.prevention) && (
                <div className="panel">
                  <div className="px-4 py-2.5 border-b border-border bg-surface-hover flex items-center gap-2">
                    <ShieldAlert size={14} className="text-accent" />
                    <h3 className="text-sm font-semibold text-primary m-0">Next Steps</h3>
                  </div>
                  <div className="p-4 bg-surface flex flex-col gap-4 text-xs">
                    {result.potentialSideEffects && (
                      <div>
                        <strong className="text-primary uppercase tracking-wider text-[10px]">Potential Side Effects</strong>
                        <p className="text-secondary mt-1 leading-relaxed">{result.potentialSideEffects}</p>
                      </div>
                    )}
                    {result.prevention && (
                      <div>
                        <strong className="text-primary uppercase tracking-wider text-[10px]">Prevention</strong>
                        <p className="text-secondary mt-1 leading-relaxed">{result.prevention}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
