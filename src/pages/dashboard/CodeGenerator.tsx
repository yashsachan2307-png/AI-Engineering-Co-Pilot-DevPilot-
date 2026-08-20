import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateCode, GenerateResponse, FileProposal } from '../../services/generationService';
import { Button } from '../../components/ui/Button';
import { 
  FolderGit2, 
  Code2, 
  RefreshCw, 
  Check,
  X,
  Copy,
  Download,
  FileCode2,
  Info,
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

export function CodeGenerator() {
  const { token } = useAuth();
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);

  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerateResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [approvedFiles, setApprovedFiles] = useState<Set<string>>(new Set());
  const [rejectedFiles, setRejectedFiles] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<{ [key: string]: 'new' | 'old' }>({});

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

  const handleGenerate = async () => {
    if (!selectedRepoId || !prompt.trim()) return;

    setIsGenerating(true);
    setResult(null);
    setError(null);
    setApprovedFiles(new Set());
    setRejectedFiles(new Set());
    setActiveTab({});

    try {
      const response = await generateCode(selectedRepoId, prompt);
      setResult(response);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to generate code');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Code copied to clipboard!');
  };

  const handleDownloadPatch = (proposal: FileProposal) => {
    const filename = proposal.path.split('/').pop() || 'patch.txt';
    let patchContent = `--- a/${proposal.path}\n+++ b/${proposal.path}\n\n`;
    patchContent += proposal.newCode;
    
    const blob = new Blob([patchContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.patch`;
    a.click();
    URL.revokeObjectURL(url);
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
            <span>CODE_GENERATOR_ENGINE</span>
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
        {/* Left Column: Prompt Input */}
        <div style={{ width: '33%', display: 'flex', flexDirection: 'column', flexShrink: 0, backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
          <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)' }}>
            <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>INSTRUCTION_INPUT</h2>
            <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', fontFamily: 'var(--font-ui)' }}>Describe the architecture-aware change to generate.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px', overflowY: 'auto' }}>
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: '200px' }}>
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Add a REST endpoint for user profile updates..."
                style={{
                  flex: 1,
                  backgroundColor: 'var(--color-bg)',
                  border: '1px solid var(--color-border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-code)',
                  padding: '12px',
                  resize: 'none',
                  outline: 'none'
                }}
              />
            </div>

            <Button 
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-code)', fontSize: '11px', padding: '12px' }}
              onClick={handleGenerate} 
              disabled={!selectedRepoId || !prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <><RefreshCw size={14} className="animate-spin mr-2" /> GENERATING_PROPOSAL...</>
              ) : (
                <><Code2 size={14} className="mr-2" /> EXECUTE_GENERATOR</>
              )}
            </Button>

            {error && (
              <div style={{ padding: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: '11px', fontFamily: 'var(--font-code)' }}>
                [ERROR] {error}
              </div>
            )}
            
            {result?.explanation && (
              <div style={{ borderLeft: '2px solid var(--color-accent)', marginTop: '16px', backgroundColor: 'var(--color-bg)' }}>
                <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Info size={14} className="text-accent" />
                  <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>STRATEGY_OVERVIEW</h3>
                </div>
                <div style={{ padding: '12px' }}>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: '1.6', margin: 0 }}>
                    {result.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results & Diff Viewer */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {!result && !isGenerating && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', opacity: 0.8, minHeight: '400px' }}>
              <Code2 size={48} className="text-muted" style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)' }}>AWAITING_INSTRUCTION</p>
            </div>
          )}

          {isGenerating && (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
              <RefreshCw size={32} className="text-accent animate-spin" style={{ marginBottom: '16px' }} />
              <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }}>COMPUTING_AST_MODIFICATIONS...</p>
              <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '400px', marginTop: '8px', lineHeight: '1.5', fontFamily: 'var(--font-code)' }}>
                Analyzing repository structure, resolving dependencies, and synthesizing syntax trees.
              </p>
            </div>
          )}

          {result && result.proposals && result.proposals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0 4px' }}>
                <FileCode2 size={16} className="text-muted" />
                <h2 style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>PROPOSED_MODIFICATIONS ({result.proposals.length})</h2>
              </div>
              
              {result.proposals.map((proposal, idx) => {
                const isApproved = approvedFiles.has(proposal.path);
                const isRejected = rejectedFiles.has(proposal.path);
                const currentTab = activeTab[proposal.path] || 'new';

                return (
                  <div 
                    key={idx} 
                    style={{
                      border: '1px solid',
                      borderColor: isApproved ? 'var(--color-success)' : (isRejected ? 'var(--color-error)' : 'var(--color-border)'),
                      backgroundColor: 'var(--color-surface)',
                      borderRadius: 'var(--radius-sm)',
                      overflow: 'hidden',
                      opacity: isRejected ? 0.6 : 1,
                      transition: 'opacity 0.2s'
                    }}
                  >
                    <div style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ padding: '12px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <h3 style={{ fontSize: '12px', fontFamily: 'var(--font-code)', color: 'var(--color-text-primary)', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {proposal.path}
                            {proposal.oldCode ? (
                              <span style={{ fontSize: '9px', backgroundColor: 'rgba(234, 179, 8, 0.2)', color: 'var(--color-warning)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>MODIFIED</span>
                            ) : (
                              <span style={{ fontSize: '9px', backgroundColor: 'rgba(34, 197, 94, 0.2)', color: 'var(--color-success)', padding: '2px 6px', borderRadius: '4px', letterSpacing: '0.05em' }}>NEW</span>
                            )}
                          </h3>
                          <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', margin: '4px 0 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{proposal.explanation}</p>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
                          <Button className="btn-secondary" style={{ padding: '4px 8px', height: '28px' }} onClick={() => handleCopy(proposal.newCode)} title="Copy Code">
                            <Copy size={12} />
                          </Button>
                          <Button className="btn-secondary" style={{ padding: '4px 8px', height: '28px' }} onClick={() => handleDownloadPatch(proposal)} title="Download Patch">
                            <Download size={12} />
                          </Button>
                          
                          <div style={{ width: '1px', height: '16px', backgroundColor: 'var(--color-border)', margin: '0 4px' }} />
                          
                          <Button 
                            className={`btn-secondary ${isApproved ? 'border-success text-success bg-success/10' : ''}`}
                            style={{ fontSize: '10px', fontFamily: 'var(--font-code)', padding: '4px 10px', height: '28px', backgroundColor: isApproved ? 'rgba(34, 197, 94, 0.1)' : undefined, borderColor: isApproved ? 'var(--color-success)' : undefined, color: isApproved ? 'var(--color-success)' : undefined }}
                            onClick={() => {
                              const newApp = new Set(approvedFiles);
                              newApp.add(proposal.path);
                              setApprovedFiles(newApp);
                              const newRej = new Set(rejectedFiles);
                              newRej.delete(proposal.path);
                              setRejectedFiles(newRej);
                            }}
                          >
                            <Check size={12} style={{ marginRight: '4px' }} /> {isApproved ? 'APPROVED' : 'APPROVE'}
                          </Button>
                          <Button 
                            className={`btn-secondary ${isRejected ? 'border-error text-error bg-error/10' : ''}`}
                            style={{ fontSize: '10px', fontFamily: 'var(--font-code)', padding: '4px 10px', height: '28px', backgroundColor: isRejected ? 'rgba(239, 68, 68, 0.1)' : undefined, borderColor: isRejected ? 'var(--color-error)' : undefined, color: isRejected ? 'var(--color-error)' : undefined }}
                            onClick={() => {
                              const newRej = new Set(rejectedFiles);
                              newRej.add(proposal.path);
                              setRejectedFiles(newRej);
                              const newApp = new Set(approvedFiles);
                              newApp.delete(proposal.path);
                              setApprovedFiles(newApp);
                            }}
                          >
                            <X size={12} style={{ marginRight: '4px' }} /> {isRejected ? 'REJECTED' : 'REJECT'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Tabs */}
                      {proposal.oldCode && (
                        <div style={{ display: 'flex', gap: '16px', padding: '0 16px' }}>
                          <button 
                            onClick={() => setActiveTab({...activeTab, [proposal.path]: 'new'})}
                            style={{
                              fontSize: '11px', fontFamily: 'var(--font-code)', paddingBottom: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: `2px solid ${currentTab === 'new' ? 'var(--color-accent)' : 'transparent'}`, color: currentTab === 'new' ? 'var(--color-accent)' : 'var(--color-text-secondary)', cursor: 'pointer', outline: 'none'
                            }}
                          >
                            PROPOSED
                          </button>
                          <button 
                            onClick={() => setActiveTab({...activeTab, [proposal.path]: 'old'})}
                            style={{
                              fontSize: '11px', fontFamily: 'var(--font-code)', paddingBottom: '8px', backgroundColor: 'transparent', border: 'none', borderBottom: `2px solid ${currentTab === 'old' ? 'var(--color-accent)' : 'transparent'}`, color: currentTab === 'old' ? 'var(--color-accent)' : 'var(--color-text-secondary)', cursor: 'pointer', outline: 'none'
                            }}
                          >
                            ORIGINAL
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div style={{ backgroundColor: 'var(--color-bg)', maxHeight: '500px', overflowY: 'auto' }}>
                       <SyntaxHighlighter 
                         language="java" 
                         style={vscDarkPlus} 
                         customStyle={{ margin: 0, padding: '16px', fontSize: '11px', fontFamily: 'var(--font-code)', background: 'transparent' }}
                         showLineNumbers={true}
                       >
                         {currentTab === 'old' && proposal.oldCode ? proposal.oldCode : proposal.newCode}
                       </SyntaxHighlighter>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
