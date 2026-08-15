import { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { generateCode, GenerateResponse, FileProposal } from '../../services/generationService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', paddingBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Code2 size={24} style={{ color: 'var(--color-accent)' }} />
            Repository-Aware Code Generator
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Propose architecture-aware changes to your codebase.
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem', alignItems: 'start' }}>
        {/* Left Column: Prompt Input */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Card>
            <CardHeader>
              <CardTitle>What should we build?</CardTitle>
              <CardDescription>Describe the feature or change.</CardDescription>
            </CardHeader>
            <CardContent style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="e.g. Add an endpoint for updating a user's profile."
                  rows={6}
                  style={{ width: '100%', padding: '0.625rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', fontSize: '0.875rem' }}
                />
              </div>

              <Button 
                variant="accent" 
                onClick={handleGenerate} 
                disabled={!selectedRepoId || !prompt.trim() || isGenerating}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
              >
                {isGenerating ? (
                  <><RefreshCw size={16} className="animate-spin" /> Analyzing Architecture & Generating...</>
                ) : (
                  <><Code2 size={16} /> Generate Proposal</>
                )}
              </Button>

              {error && (
                <div style={{ padding: '0.75rem', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' }}>
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {result?.explanation && (
             <Card style={{ borderColor: 'var(--color-accent)' }}>
                <CardHeader style={{ paddingBottom: '0.5rem' }}>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '1rem' }}>
                    <Info size={16} /> Strategy Overview
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                    {result.explanation}
                  </p>
                </CardContent>
             </Card>
          )}
        </div>

        {/* Right Column: Results & Diff Viewer */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {!result && !isGenerating && (
            <Card style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: 'var(--color-bg-secondary)', borderStyle: 'dashed' }}>
              <div style={{ textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                <Code2 size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>Submit a request to generate architecture-aware code proposals.</p>
              </div>
            </Card>
          )}

          {isGenerating && (
            <Card style={{ height: '100%', minHeight: '400px' }}>
              <CardContent style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <RefreshCw size={32} className="animate-spin" style={{ color: 'var(--color-accent)' }} />
                <p style={{ fontWeight: 600 }}>Crafting Proposal...</p>
                <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', textAlign: 'center', maxWidth: '80%' }}>
                  Inspecting controllers, services, DTOs, and repositories to ensure the generated code fits your established patterns.
                </p>
              </CardContent>
            </Card>
          )}

          {result && result.proposals && result.proposals.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileCode2 size={20} /> Proposed File Changes ({result.proposals.length})
              </h2>
              
              {result.proposals.map((proposal, idx) => {
                const isApproved = approvedFiles.has(proposal.path);
                const isRejected = rejectedFiles.has(proposal.path);
                const currentTab = activeTab[proposal.path] || 'new';

                return (
                  <Card 
                    key={idx} 
                    style={{ 
                      opacity: isRejected ? 0.6 : 1,
                      borderColor: isApproved ? 'var(--color-success, #10b981)' : (isRejected ? 'var(--color-danger, #ef4444)' : 'var(--color-border)') 
                    }}
                  >
                    <CardHeader style={{ paddingBottom: '0.5rem', backgroundColor: 'var(--color-bg-secondary)', borderBottom: '1px solid var(--color-border)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <CardTitle style={{ fontSize: '1rem', fontFamily: 'monospace' }}>
                            {proposal.path}
                            {proposal.oldCode ? (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#eab308', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>MODIFIED</span>
                            ) : (
                              <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>NEW</span>
                            )}
                          </CardTitle>
                          <CardDescription style={{ marginTop: '0.25rem' }}>{proposal.explanation}</CardDescription>
                        </div>
                        
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button size="sm" variant="outline" onClick={() => handleCopy(proposal.newCode)} title="Copy Code">
                            <Copy size={14} />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDownloadPatch(proposal)} title="Download Patch">
                            <Download size={14} />
                          </Button>
                          
                          <div style={{ width: '1px', backgroundColor: 'var(--color-border)', margin: '0 0.25rem' }}></div>
                          
                          <Button 
                            size="sm" 
                            variant="outline" 
                            style={{ 
                              color: isApproved ? '#10b981' : 'var(--color-text)', 
                              borderColor: isApproved ? '#10b981' : 'var(--color-border)' 
                            }}
                            onClick={() => {
                              const newApp = new Set(approvedFiles);
                              newApp.add(proposal.path);
                              setApprovedFiles(newApp);
                              const newRej = new Set(rejectedFiles);
                              newRej.delete(proposal.path);
                              setRejectedFiles(newRej);
                            }}
                          >
                            <Check size={14} /> {isApproved ? 'Approved' : 'Approve'}
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            style={{ 
                              color: isRejected ? '#ef4444' : 'var(--color-text)', 
                              borderColor: isRejected ? '#ef4444' : 'var(--color-border)' 
                            }}
                            onClick={() => {
                              const newRej = new Set(rejectedFiles);
                              newRej.add(proposal.path);
                              setRejectedFiles(newRej);
                              const newApp = new Set(approvedFiles);
                              newApp.delete(proposal.path);
                              setApprovedFiles(newApp);
                            }}
                          >
                            <X size={14} /> {isRejected ? 'Rejected' : 'Reject'}
                          </Button>
                        </div>
                      </div>
                      
                      {/* Tabs */}
                      {proposal.oldCode && (
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                          <button 
                            onClick={() => setActiveTab({...activeTab, [proposal.path]: 'new'})}
                            style={{ 
                              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                              color: currentTab === 'new' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                              borderBottom: currentTab === 'new' ? '2px solid var(--color-accent)' : '2px solid transparent',
                              paddingBottom: '0.25rem'
                            }}
                          >
                            Proposed Changes
                          </button>
                          <button 
                            onClick={() => setActiveTab({...activeTab, [proposal.path]: 'old'})}
                            style={{ 
                              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600,
                              color: currentTab === 'old' ? 'var(--color-accent)' : 'var(--color-text-secondary)',
                              borderBottom: currentTab === 'old' ? '2px solid var(--color-accent)' : '2px solid transparent',
                              paddingBottom: '0.25rem'
                            }}
                          >
                            Original Code
                          </button>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent style={{ padding: 0 }}>
                       <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                         <SyntaxHighlighter 
                           language="java" 
                           style={vscDarkPlus} 
                           customStyle={{ margin: 0, border: 'none', borderRadius: '0 0 var(--radius-md) var(--radius-md)' }}
                           showLineNumbers={true}
                         >
                           {currentTab === 'old' && proposal.oldCode ? proposal.oldCode : proposal.newCode}
                         </SyntaxHighlighter>
                       </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
