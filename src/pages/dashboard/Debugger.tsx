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
  Lightbulb,
  History,
  Trash2,
  TerminalSquare
} from 'lucide-react';
import { API_BASE_URL } from '../../services/api';
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
      const res = await fetch(`${API_BASE_URL}/api/repositories`, {
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
            <span>AI_DEBUGGER_ENGINE</span>
          </div>
          
          <div style={{ height: 16, width: 1, backgroundColor: 'var(--color-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)' }}>
            <FolderGit2 size={12} className="text-muted" />
            <select
              value={selectedRepoId || ''}
              onChange={(e) => setSelectedRepoId(Number(e.target.value))}
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
              {repositories.length === 0 && <option value="">NO_REPOSITORIES</option>}
              {repositories.map(r => (
                <option key={r.id} value={r.id} style={{ background: 'var(--color-surface)' }}>
                  {r.fullName || r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left Column: Inputs */}
        <div style={{ width: '33%', display: 'flex', flexDirection: 'column', flexShrink: 0, backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>ERROR_TELEMETRY</h2>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', fontFamily: 'var(--font-ui)' }}>Provide the error message and stack trace.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflowY: 'auto' }}>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>ERROR_MESSAGE (REQUIRED)</label>
              <input 
                type="text" 
                value={errorMessage}
                onChange={e => setErrorMessage(e.target.value)}
                placeholder="e.g. NullPointerException in UserService.java"
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-code)',
                  padding: '10px',
                  outline: 'none'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1, minHeight: '200px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>STACK_TRACE</label>
              <textarea 
                value={stackTrace}
                onChange={e => setStackTrace(e.target.value)}
                placeholder="Paste the full stack trace here..."
                style={{
                  flex: 1,
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: '11px',
                  fontFamily: 'var(--font-code)',
                  padding: '10px',
                  resize: 'none',
                  outline: 'none',
                  whiteSpace: 'pre'
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>CONTEXT (OPTIONAL)</label>
              <textarea 
                value={userDescription}
                onChange={e => setUserDescription(e.target.value)}
                placeholder="Steps to reproduce..."
                rows={3}
                style={{
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: '12px',
                  fontFamily: 'var(--font-code)',
                  padding: '10px',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            <Button 
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-code)', fontSize: '11px', padding: '12px', marginTop: '8px' }}
              onClick={handleAnalyze} 
              disabled={!selectedRepoId || !errorMessage.trim() || isAnalyzing}
            >
              {isAnalyzing ? (
                <><RefreshCw size={14} className="animate-spin mr-2" /> ANALYZING_CONTEXT...</>
              ) : (
                <><Bug size={14} className="mr-2" /> EXECUTE_DIAGNOSTIC</>
              )}
            </Button>

            {error && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-code)', marginTop: '8px' }}>
                [ERROR] {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {!result && !isAnalyzing && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', opacity: 0.8, minHeight: '400px' }}>
              <Bug size={48} className="text-muted" style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)' }}>AWAITING_TELEMETRY</p>
            </div>
          )}

          {isAnalyzing && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <RefreshCw size={32} className="text-accent animate-spin" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }}>GATHERING_CONTEXT...</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '400px', marginTop: '8px', lineHeight: '1.5', fontFamily: 'var(--font-code)' }}>
                Searching codebase, building syntax tree, analyzing execution flow.
              </p>
            </div>
          )}

          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-error)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '8px 16px', backgroundColor: 'rgba(239, 68, 68, 0.05)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <AlertTriangle size={14} className="text-error" />
                  <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-error)', margin: 0, fontFamily: 'var(--font-code)' }}>ROOT_CAUSE_DIAGNOSIS</h3>
                </div>
                <div style={{ padding: '16px' }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '8px', lineHeight: '1.6', margin: 0, fontFamily: 'var(--font-code)' }}>{result.rootCause}</p>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: '8px 0 0 0', fontFamily: 'var(--font-code)' }}>{result.evidence}</p>
                </div>
              </div>

              {result.suggestedFix && (
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderLeft: '4px solid var(--color-success)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 16px', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CheckCircle2 size={14} className="text-success" />
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-success)', margin: 0, fontFamily: 'var(--font-code)' }}>SUGGESTED_FIX</h3>
                  </div>
                  <div style={{ padding: '16px', backgroundColor: 'var(--color-bg)' }}>
                    <div style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                      <SyntaxHighlighter language="markdown" style={vscDarkPlus} customStyle={{ margin: 0, fontSize: '11px', fontFamily: 'var(--font-code)', padding: '16px', background: 'transparent' }}>
                        {result.suggestedFix}
                      </SyntaxHighlighter>
                    </div>
                  </div>
                </div>
              )}

              {result.relevantFiles && result.relevantFiles.length > 0 && (
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FileCode2 size={14} className="text-muted" />
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>RELEVANT_FILES</h3>
                  </div>
                  <div style={{ padding: '12px' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-text-secondary)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                      {result.relevantFiles.map((file, idx) => (
                        <li key={idx} style={{ marginBottom: '4px' }}><code style={{ color: 'var(--color-text-primary)' }}>{file}</code></li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {(result.likelyCauses && result.likelyCauses.length > 0) && (
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Lightbulb size={14} className="text-warning" />
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>POSSIBLE_CAUSES</h3>
                  </div>
                  <div style={{ padding: '16px' }}>
                    <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--color-text-secondary)', fontSize: '12px', lineHeight: '1.6' }}>
                      {result.likelyCauses.map((cause, idx) => (
                        <li key={idx} style={{ marginBottom: '6px' }}>{cause}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {(result.potentialSideEffects || result.prevention) && (
                <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                  <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <ShieldAlert size={14} className="text-accent" />
                    <h3 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>NEXT_STEPS</h3>
                  </div>
                  <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', fontSize: '12px' }}>
                    {result.potentialSideEffects && (
                      <div>
                        <strong style={{ color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px', fontFamily: 'var(--font-code)' }}>POTENTIAL_SIDE_EFFECTS</strong>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.6', margin: 0 }}>{result.potentialSideEffects}</p>
                      </div>
                    )}
                    {result.prevention && (
                      <div>
                        <strong style={{ color: 'var(--color-text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '10px', fontFamily: 'var(--font-code)' }}>PREVENTION</strong>
                        <p style={{ color: 'var(--color-text-secondary)', marginTop: '4px', lineHeight: '1.6', margin: 0 }}>{result.prevention}</p>
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
