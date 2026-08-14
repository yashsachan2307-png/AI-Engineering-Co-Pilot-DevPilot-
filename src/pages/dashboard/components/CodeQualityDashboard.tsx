import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Info, 
  Play, 
  RefreshCw, 
  Search, 
  Code2, 
  FileCode, 
  Layers, 
  Flame, 
  Wrench, 
  HelpCircle
} from 'lucide-react';

interface StaticAnalysisFinding {
  id: number;
  fileName: string;
  line: number;
  severity: string;
  category: string;
  title: string;
  description: string;
  metric: string;
  recommendation: string;
}

export function CodeQualityDashboard({ repositoryId }: { repositoryId: string }) {
  const { token } = useAuth();
  const [status, setStatus] = useState<string>('NONE');
  const [findings, setFindings] = useState<StaticAnalysisFinding[]>([]);
  const [selectedFinding, setSelectedFinding] = useState<StaticAnalysisFinding | null>(null);
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fileSnippet, setFileSnippet] = useState<{ content: string; startLine: number } | null>(null);
  const [loadingSnippet, setLoadingSnippet] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [repositoryId, token]);

  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/repositories/${repositoryId}/analysis/static-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status) {
          setStatus(data.status);
          if (data.status === 'COMPLETED' && findings.length === 0) {
            fetchFindings();
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFindings = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/repositories/${repositoryId}/analysis/findings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFindings(data);
        if (data.length > 0 && !selectedFinding) {
          handleSelectFinding(data[0]);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startAnalysis = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/repositories/${repositoryId}/analysis/static`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setStatus('QUEUED');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSelectFinding = async (finding: StaticAnalysisFinding) => {
    setSelectedFinding(finding);
    setLoadingSnippet(true);
    setFileSnippet(null);

    if (!token) {
      setLoadingSnippet(false);
      return;
    }

    try {
      // Find all files to locate repositoryFileId if available or query file content
      const filesRes = await fetch(`http://localhost:8080/api/repositories/${repositoryId}/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (filesRes.ok) {
        const files: any[] = await filesRes.json();
        const matched = files.find(f => f.path === finding.fileName);
        if (matched) {
          const contentRes = await fetch(`http://localhost:8080/api/repositories/${repositoryId}/files/${matched.id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (contentRes.ok) {
            const data = await contentRes.json();
            const lines = (data.content || '').split('\n');
            const targetLine = finding.line || 1;
            const startLine = Math.max(1, targetLine - 4);
            const endLine = Math.min(lines.length, targetLine + 4);
            const snippetLines = lines.slice(startLine - 1, endLine);
            setFileSnippet({
              content: snippetLines.join('\n'),
              startLine
            });
          }
        }
      }
    } catch (e) {
      console.error('Failed to load code context snippet:', e);
    } finally {
      setLoadingSnippet(false);
    }
  };

  // Metrics summary
  const metrics = useMemo(() => {
    const total = findings.length;
    const high = findings.filter(f => f.severity === 'High').length;
    const medium = findings.filter(f => f.severity === 'Medium').length;
    const low = findings.filter(f => f.severity === 'Low').length;

    const complexity = findings.filter(f => f.category === 'Complexity').length;
    const maintainability = findings.filter(f => f.category === 'Maintainability').length;
    const codeSmells = findings.filter(f => f.category === 'Code Smells').length;
    const architecture = findings.filter(f => f.category === 'Architecture').length;

    return { total, high, medium, low, complexity, maintainability, codeSmells, architecture };
  }, [findings]);

  // Filtered findings
  const filteredFindings = useMemo(() => {
    return findings.filter(f => {
      const matchSeverity = filterSeverity === 'ALL' || f.severity.toLowerCase() === filterSeverity.toLowerCase();
      const matchCategory = filterCategory === 'ALL' || f.category.toLowerCase() === filterCategory.toLowerCase();
      const matchSearch = !searchQuery.trim() || 
        f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase());
      return matchSeverity && matchCategory && matchSearch;
    });
  }, [findings, filterSeverity, filterCategory, searchQuery]);

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'high':
        return (
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            color: '#f87171',
            border: '1px solid rgba(239, 68, 68, 0.3)'
          }}>
            <ShieldAlert size={12} /> High
          </span>
        );
      case 'medium':
        return (
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            color: '#fbbf24',
            border: '1px solid rgba(245, 158, 11, 0.3)'
          }}>
            <AlertTriangle size={12} /> Medium
          </span>
        );
      default:
        return (
          <span style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            gap: '4px',
            padding: '2px 8px', 
            borderRadius: '12px', 
            fontSize: '0.75rem', 
            fontWeight: 600,
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            color: '#60a5fa',
            border: '1px solid rgba(59, 130, 246, 0.3)'
          }}>
            <Info size={12} /> Low
          </span>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', overflow: 'hidden' }}>
      
      {/* Top Banner & Action */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '16px 20px', 
        backgroundColor: 'var(--color-surface)', 
        borderRadius: '12px',
        border: '1px solid var(--color-border)',
        flexShrink: 0
      }}>
        <div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Code2 size={20} color="var(--color-primary)" /> Static Code Quality Analysis
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', margin: '4px 0 0 0' }}>
            Deterministic AST checks covering complexity, maintainability, code smells, and architecture rules.
          </p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--color-text-secondary)' }}>Status:</span>
            <span style={{ 
              fontWeight: 600, 
              padding: '2px 8px', 
              borderRadius: '4px',
              backgroundColor: status === 'COMPLETED' ? 'rgba(34, 197, 94, 0.15)' : status === 'PROCESSING' || status === 'QUEUED' ? 'rgba(234, 179, 8, 0.15)' : 'var(--color-surface-hover)',
              color: status === 'COMPLETED' ? '#4ade80' : status === 'PROCESSING' || status === 'QUEUED' ? '#facc15' : 'var(--color-text-secondary)'
            }}>
              {status}
            </span>
          </div>

          <button
            onClick={startAnalysis}
            disabled={status === 'QUEUED' || status === 'PROCESSING'}
            className="btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 16px',
              backgroundColor: status === 'QUEUED' || status === 'PROCESSING' ? '#4b5563' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: status === 'QUEUED' || status === 'PROCESSING' ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            {status === 'QUEUED' || status === 'PROCESSING' ? (
              <>
                <RefreshCw size={14} className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Play size={14} /> Run Analysis
              </>
            )}
          </button>
        </div>
      </div>

      {status === 'COMPLETED' && (
        <>
          {/* Summary Cards */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', 
            gap: '12px',
            flexShrink: 0
          }}>
            {/* Total */}
            <div style={{ 
              padding: '14px 16px', 
              backgroundColor: 'var(--color-surface)', 
              borderRadius: '10px', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Issues</span>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{metrics.total}</span>
                <span style={{ fontSize: '0.75rem', color: '#f87171' }}>{metrics.high} high</span>
              </div>
            </div>

            {/* Complexity */}
            <div style={{ 
              padding: '14px 16px', 
              backgroundColor: 'var(--color-surface)', 
              borderRadius: '10px', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Flame size={14} color="#f59e0b" /> Complexity
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{metrics.complexity}</span>
            </div>

            {/* Maintainability */}
            <div style={{ 
              padding: '14px 16px', 
              backgroundColor: 'var(--color-surface)', 
              borderRadius: '10px', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Wrench size={14} color="#3b82f6" /> Maintainability
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{metrics.maintainability}</span>
            </div>

            {/* Code Smells */}
            <div style={{ 
              padding: '14px 16px', 
              backgroundColor: 'var(--color-surface)', 
              borderRadius: '10px', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <AlertTriangle size={14} color="#ec4899" /> Code Smells
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{metrics.codeSmells}</span>
            </div>

            {/* Architecture */}
            <div style={{ 
              padding: '14px 16px', 
              backgroundColor: 'var(--color-surface)', 
              borderRadius: '10px', 
              border: '1px solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Layers size={14} color="#8b5cf6" /> Architecture
              </span>
              <span style={{ fontSize: '1.6rem', fontWeight: 700 }}>{metrics.architecture}</span>
            </div>
          </div>

          {/* Main Content Area: Left list & Right Inspector */}
          <div style={{ display: 'flex', flex: 1, gap: '16px', overflow: 'hidden' }}>
            
            {/* Left Panel: Filter & List */}
            <div style={{ 
              flex: '0 0 380px', 
              display: 'flex', 
              flexDirection: 'column', 
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              padding: '14px',
              gap: '12px',
              overflow: 'hidden'
            }}>
              {/* Search Bar */}
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-secondary)' }} />
                <input
                  type="text"
                  placeholder="Search file or issue..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px 8px 30px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    color: 'var(--color-text)',
                    fontSize: '0.85rem'
                  }}
                />
              </div>

              {/* Filters Row */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <select
                  value={filterSeverity}
                  onChange={e => setFilterSeverity(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    color: 'var(--color-text)',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="ALL">All Severities</option>
                  <option value="High">High ({metrics.high})</option>
                  <option value="Medium">Medium ({metrics.medium})</option>
                  <option value="Low">Low ({metrics.low})</option>
                </select>

                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '6px 8px',
                    borderRadius: '6px',
                    border: '1px solid var(--color-border)',
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    color: 'var(--color-text)',
                    fontSize: '0.8rem'
                  }}
                >
                  <option value="ALL">All Categories</option>
                  <option value="Complexity">Complexity</option>
                  <option value="Maintainability">Maintainability</option>
                  <option value="Code Smells">Code Smells</option>
                  <option value="Architecture">Architecture</option>
                </select>
              </div>

              {/* Issues List */}
              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                {filteredFindings.map(finding => {
                  const isSelected = selectedFinding?.id === finding.id;
                  const fileShortName = finding.fileName.split('/').pop();
                  return (
                    <div
                      key={finding.id}
                      onClick={() => handleSelectFinding(finding)}
                      style={{
                        padding: '12px',
                        borderRadius: '8px',
                        border: isSelected ? '1px solid var(--color-primary)' : '1px solid var(--color-border)',
                        backgroundColor: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(0,0,0,0.15)',
                        cursor: 'pointer',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', textTransform: 'uppercase', fontWeight: 600 }}>
                          {finding.category}
                        </span>
                        {getSeverityBadge(finding.severity)}
                      </div>

                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isSelected ? 'var(--color-primary)' : 'var(--color-text)' }}>
                        {finding.title}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                        <FileCode size={13} />
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                          {fileShortName} : Line {finding.line}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredFindings.length === 0 && (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                    <CheckCircle2 size={32} color="#22c55e" style={{ margin: '0 auto 10px auto' }} />
                    <p>No issues matching your filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Finding Inspector */}
            <div style={{ 
              flex: 1, 
              backgroundColor: 'var(--color-surface)',
              borderRadius: '12px',
              border: '1px solid var(--color-border)',
              padding: '20px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '18px'
            }}>
              {selectedFinding ? (
                <>
                  {/* Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--color-border)', paddingBottom: '16px' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                        {getSeverityBadge(selectedFinding.severity)}
                        <span style={{ 
                          fontSize: '0.75rem', 
                          padding: '2px 8px', 
                          borderRadius: '4px', 
                          backgroundColor: 'rgba(255,255,255,0.06)',
                          color: 'var(--color-text-secondary)',
                          fontWeight: 500
                        }}>
                          {selectedFinding.category}
                        </span>
                      </div>
                      <h3 style={{ fontSize: '1.3rem', fontWeight: 600, margin: 0 }}>{selectedFinding.title}</h3>
                    </div>

                    <div style={{ 
                      padding: '6px 12px', 
                      backgroundColor: 'rgba(0,0,0,0.25)', 
                      borderRadius: '6px', 
                      fontSize: '0.8rem', 
                      fontFamily: 'monospace',
                      color: 'var(--color-text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <FileCode size={14} />
                      {selectedFinding.fileName}:{selectedFinding.line}
                    </div>
                  </div>

                  {/* Metric / Evidence Banner */}
                  <div style={{ 
                    padding: '12px 16px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(99, 102, 241, 0.1)', 
                    border: '1px solid rgba(99, 102, 241, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px'
                  }}>
                    <Flame size={18} color="var(--color-primary)" />
                    <div>
                      <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-text-secondary)', fontWeight: 600 }}>
                        Metric Evidence
                      </div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text)' }}>
                        {selectedFinding.metric}
                      </div>
                    </div>
                  </div>

                  {/* Code Context Preview */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Code2 size={15} /> Code Context (Around Line {selectedFinding.line})
                    </div>
                    {loadingSnippet ? (
                      <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                        Loading code snippet...
                      </div>
                    ) : fileSnippet ? (
                      <div style={{ 
                        fontFamily: 'Consolas, Monaco, "Courier New", monospace', 
                        fontSize: '0.85rem',
                        backgroundColor: '#0d1117',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border)',
                        overflow: 'hidden'
                      }}>
                        {fileSnippet.content.split('\n').map((lineText, idx) => {
                          const currentLineNum = fileSnippet.startLine + idx;
                          const isTarget = currentLineNum === selectedFinding.line;
                          return (
                            <div 
                              key={idx}
                              style={{ 
                                display: 'flex', 
                                backgroundColor: isTarget ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                                borderLeft: isTarget ? '3px solid #ef4444' : '3px solid transparent',
                                padding: '2px 8px'
                              }}
                            >
                              <span style={{ width: '40px', textAlign: 'right', marginRight: '16px', color: isTarget ? '#ef4444' : '#6e7681', userSelect: 'none' }}>
                                {currentLineNum}
                              </span>
                              <span style={{ color: isTarget ? '#ffffff' : '#c9d1d9', whiteSpace: 'pre' }}>
                                {lineText}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div style={{ 
                        padding: '14px', 
                        borderRadius: '6px', 
                        backgroundColor: 'rgba(0,0,0,0.2)', 
                        color: 'var(--color-text-secondary)',
                        fontSize: '0.85rem'
                      }}>
                        {selectedFinding.fileName}:{selectedFinding.line}
                      </div>
                    )}
                  </div>

                  {/* Description / Explanation */}
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '6px' }}>
                      Explanation
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.5', color: 'var(--color-text)' }}>
                      {selectedFinding.description}
                    </p>
                  </div>

                  {/* Recommendation */}
                  <div style={{ 
                    padding: '14px 16px', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(34, 197, 94, 0.08)', 
                    border: '1px solid rgba(34, 197, 94, 0.25)',
                    marginTop: 'auto'
                  }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#4ade80', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CheckCircle2 size={15} /> Actionable Recommendation
                    </div>
                    <p style={{ margin: 0, fontSize: '0.9rem', color: '#86efac', lineHeight: '1.4' }}>
                      {selectedFinding.recommendation}
                    </p>
                  </div>
                </>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', gap: '10px' }}>
                  <HelpCircle size={36} style={{ opacity: 0.5 }} />
                  <p>Select an issue from the list to view code context, metrics, and remediation.</p>
                </div>
              )}
            </div>

          </div>
        </>
      )}

      {status !== 'COMPLETED' && status !== 'NONE' && (
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
          <RefreshCw size={36} color="var(--color-primary)" className="animate-spin" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Static Analysis in Progress</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '420px', margin: 0 }}>
            Analyzing Java AST structures, calculating cyclomatic complexity, nesting depth, and detecting architectural code smells.
          </p>
        </div>
      )}

      {status === 'NONE' && (
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
          <ShieldAlert size={44} color="var(--color-primary)" style={{ marginBottom: '16px', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>No Static Analysis Run Yet</h3>
          <p style={{ color: 'var(--color-text-secondary)', maxWidth: '420px', marginBottom: '20px' }}>
            Execute deterministic checks on this codebase to find complexity hotspots, maintainability bottlenecks, and architectural code smells.
          </p>
          <button 
            onClick={startAnalysis}
            className="btn-primary"
            style={{
              padding: '10px 20px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 500,
              cursor: 'pointer'
            }}
          >
            Run Static Analysis
          </button>
        </div>
      )}

    </div>
  );
}
