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
  Info
} from 'lucide-react';
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
    <div className="flex flex-col gap-4 h-full bg-bg overflow-hidden">
      <div className="panel border-b-0 border-l-0 border-r-0 rounded-none flex justify-between items-center px-4 py-3 shrink-0 bg-surface">
        <div>
          <h1 className="text-sm font-semibold text-primary flex items-center gap-2 m-0">
            <Code2 size={16} className="text-accent" />
            Repository-Aware Code Generator
          </h1>
          <p className="text-xs text-secondary mt-1 m-0">
            Propose architecture-aware changes to your codebase.
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
        {/* Left Column: Prompt Input */}
        <div className="panel w-1/3 flex flex-col shrink-0 bg-surface border-l-0 border-r border-t border-b-0 rounded-none">
          <div className="px-4 py-3 border-b border-border bg-surface-hover">
            <h2 className="text-sm font-semibold text-primary m-0">What should we build?</h2>
            <p className="text-xs text-secondary m-0 mt-0.5">Describe the feature or change.</p>
          </div>
          <div className="flex flex-col gap-4 p-4 overflow-y-auto">
            <div className="flex flex-col gap-1.5 flex-1 min-h-[200px]">
              <textarea 
                value={prompt}
                onChange={e => setPrompt(e.target.value)}
                placeholder="e.g. Add an endpoint for updating a user's profile."
                className="input flex-1 text-xs resize-none"
              />
            </div>

            <Button 
              className="btn-primary w-full justify-center text-xs py-2"
              onClick={handleGenerate} 
              disabled={!selectedRepoId || !prompt.trim() || isGenerating}
            >
              {isGenerating ? (
                <><RefreshCw size={14} className="animate-spin mr-2" /> Analyzing Architecture & Generating...</>
              ) : (
                <><Code2 size={14} className="mr-2" /> Generate Proposal</>
              )}
            </Button>

            {error && (
              <div className="p-3 bg-error/10 text-error border border-error/30 rounded text-xs mt-2">
                {error}
              </div>
            )}
            
            {result?.explanation && (
              <div className="panel border-l-2 border-accent mt-4">
                <div className="px-3 py-2 border-b border-border bg-surface-hover flex items-center gap-2">
                  <Info size={14} className="text-accent" />
                  <h3 className="text-xs font-semibold text-primary m-0">Strategy Overview</h3>
                </div>
                <div className="p-3 bg-surface">
                  <p className="text-xs text-secondary leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Results & Diff Viewer */}
        <div className="flex-1 overflow-y-auto pr-4 pb-4">
          {!result && !isGenerating && (
            <div className="h-full flex flex-col items-center justify-center text-muted border border-dashed border-border rounded-lg bg-surface/50 min-h-[400px]">
              <Code2 size={48} className="opacity-30 mb-4" />
              <p className="text-sm">Submit a request to generate architecture-aware code proposals.</p>
            </div>
          )}

          {isGenerating && (
            <div className="h-full flex flex-col items-center justify-center min-h-[400px]">
              <RefreshCw size={32} className="text-accent animate-spin mb-4" />
              <p className="text-sm font-semibold text-primary">Crafting Proposal...</p>
              <p className="text-xs text-secondary text-center max-w-sm mt-2">
                Inspecting controllers, services, DTOs, and repositories to ensure the generated code fits your established patterns.
              </p>
            </div>
          )}

          {result && result.proposals && result.proposals.length > 0 && (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2 px-1">
                <FileCode2 size={16} className="text-muted" />
                <h2 className="text-sm font-semibold text-primary m-0">Proposed File Changes ({result.proposals.length})</h2>
              </div>
              
              {result.proposals.map((proposal, idx) => {
                const isApproved = approvedFiles.has(proposal.path);
                const isRejected = rejectedFiles.has(proposal.path);
                const currentTab = activeTab[proposal.path] || 'new';

                return (
                  <div 
                    key={idx} 
                    className={`panel overflow-hidden transition-opacity ${isRejected ? 'opacity-60' : ''}`}
                    style={{
                      borderColor: isApproved ? 'var(--color-success)' : (isRejected ? 'var(--color-error)' : 'var(--color-border)')
                    }}
                  >
                    <div className="bg-surface-hover border-b border-border">
                      <div className="px-4 py-3 flex justify-between items-start gap-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-mono text-primary m-0 flex items-center gap-2 truncate">
                            {proposal.path}
                            {proposal.oldCode ? (
                              <span className="text-[10px] bg-warning/20 text-warning px-1.5 py-0.5 rounded tracking-wider font-sans">MODIFIED</span>
                            ) : (
                              <span className="text-[10px] bg-success/20 text-success px-1.5 py-0.5 rounded tracking-wider font-sans">NEW</span>
                            )}
                          </h3>
                          <p className="text-xs text-secondary mt-1 m-0 truncate">{proposal.explanation}</p>
                        </div>
                        
                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button className="btn-secondary px-2 py-1 h-7" onClick={() => handleCopy(proposal.newCode)} title="Copy Code">
                            <Copy size={12} />
                          </Button>
                          <Button className="btn-secondary px-2 py-1 h-7" onClick={() => handleDownloadPatch(proposal)} title="Download Patch">
                            <Download size={12} />
                          </Button>
                          
                          <div className="w-px h-4 bg-border mx-1"></div>
                          
                          <Button 
                            className={`btn-secondary text-[11px] px-2.5 py-1 h-7 ${isApproved ? 'border-success text-success bg-success/10' : ''}`}
                            onClick={() => {
                              const newApp = new Set(approvedFiles);
                              newApp.add(proposal.path);
                              setApprovedFiles(newApp);
                              const newRej = new Set(rejectedFiles);
                              newRej.delete(proposal.path);
                              setRejectedFiles(newRej);
                            }}
                          >
                            <Check size={12} className="mr-1" /> {isApproved ? 'Approved' : 'Approve'}
                          </Button>
                          <Button 
                            className={`btn-secondary text-[11px] px-2.5 py-1 h-7 ${isRejected ? 'border-error text-error bg-error/10' : ''}`}
                            onClick={() => {
                              const newRej = new Set(rejectedFiles);
                              newRej.add(proposal.path);
                              setRejectedFiles(newRej);
                              const newApp = new Set(approvedFiles);
                              newApp.delete(proposal.path);
                              setApprovedFiles(newApp);
                            }}
                          >
                            <X size={12} className="mr-1" /> {isRejected ? 'Rejected' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Tabs */}
                      {proposal.oldCode && (
                        <div className="flex gap-4 px-4">
                          <button 
                            onClick={() => setActiveTab({...activeTab, [proposal.path]: 'new'})}
                            className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${currentTab === 'new' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary'}`}
                          >
                            Proposed Changes
                          </button>
                          <button 
                            onClick={() => setActiveTab({...activeTab, [proposal.path]: 'old'})}
                            className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${currentTab === 'old' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-primary'}`}
                          >
                            Original Code
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-surface max-h-[500px] overflow-y-auto">
                       <SyntaxHighlighter 
                         language="java" 
                         style={vscDarkPlus} 
                         customStyle={{ margin: 0, padding: '16px', fontSize: '11px', background: 'transparent' }}
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
