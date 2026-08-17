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
import { Button } from '../../../components/ui/Button';

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
          <span className="badge badge-error">
            <ShieldAlert size={12} className="mr-1" /> High
          </span>
        );
      case 'medium':
        return (
          <span className="badge badge-warning">
            <AlertTriangle size={12} className="mr-1" /> Medium
          </span>
        );
      default:
        return (
          <span className="badge badge-info">
            <Info size={12} className="mr-1" /> Low
          </span>
        );
    }
  };

  return (
    <div className="flex flex-col h-full bg-bg">
      
      {/* Top Banner & Action */}
      <div className="panel border-b-0 border-l-0 border-r-0 rounded-none flex justify-between items-center px-4 py-3 shrink-0 bg-surface">
        <div>
          <h2 className="text-sm font-semibold text-primary flex items-center gap-2 m-0">
            <Code2 size={16} className="text-accent" /> Static Code Quality Analysis
          </h2>
          <p className="text-xs text-secondary mt-1 m-0">
            Deterministic AST checks covering complexity, maintainability, code smells, and architecture rules.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-secondary">Status:</span>
            <span className={
              status === 'COMPLETED' ? 'text-success font-semibold' : 
              status === 'PROCESSING' || status === 'QUEUED' ? 'text-warning font-semibold' : 
              'text-secondary'
            }>
              {status}
            </span>
          </div>

          <Button
            onClick={startAnalysis}
            disabled={status === 'QUEUED' || status === 'PROCESSING'}
            className="btn-primary py-1 px-3 text-xs flex items-center gap-2"
          >
            {status === 'QUEUED' || status === 'PROCESSING' ? (
              <>
                <RefreshCw size={12} className="animate-spin" /> Analyzing
              </>
            ) : (
              <>
                <Play size={12} /> Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {status === 'COMPLETED' && (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Summary Cards */}
          <div className="grid grid-cols-5 gap-0 border-b border-border shrink-0 bg-surface">
            {/* Total */}
            <div className="p-3 border-r border-border flex flex-col gap-1">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold">Total Issues</span>
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-mono font-bold text-primary">{metrics.total}</span>
                <span className="text-[10px] text-error font-medium">{metrics.high} high</span>
              </div>
            </div>

            {/* Complexity */}
            <div className="p-3 border-r border-border flex flex-col gap-1">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold flex items-center gap-1">
                <Flame size={12} className="text-warning" /> Complexity
              </span>
              <span className="text-lg font-mono font-bold text-primary">{metrics.complexity}</span>
            </div>

            {/* Maintainability */}
            <div className="p-3 border-r border-border flex flex-col gap-1">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold flex items-center gap-1">
                <Wrench size={12} className="text-accent" /> Maintainability
              </span>
              <span className="text-lg font-mono font-bold text-primary">{metrics.maintainability}</span>
            </div>

            {/* Code Smells */}
            <div className="p-3 border-r border-border flex flex-col gap-1">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold flex items-center gap-1">
                <AlertTriangle size={12} className="text-pink-500" /> Code Smells
              </span>
              <span className="text-lg font-mono font-bold text-primary">{metrics.codeSmells}</span>
            </div>

            {/* Architecture */}
            <div className="p-3 flex flex-col gap-1">
              <span className="text-[10px] text-secondary uppercase tracking-wider font-semibold flex items-center gap-1">
                <Layers size={12} className="text-purple-500" /> Architecture
              </span>
              <span className="text-lg font-mono font-bold text-primary">{metrics.architecture}</span>
            </div>
          </div>

          {/* Main Content Area: Split Pane */}
          <div className="flex flex-1 overflow-hidden">
            
            {/* Left Panel: Filter & List */}
            <div className="flex flex-col w-[350px] border-r border-border bg-surface-hover/30 shrink-0">
              
              {/* Search & Filters */}
              <div className="p-2 border-b border-border flex flex-col gap-2 bg-surface">
                <div className="relative">
                  <Search size={14} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    placeholder="Search file or issue..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="input w-full pl-7 text-xs py-1.5"
                  />
                </div>

                <div className="flex gap-2">
                  <select
                    value={filterSeverity}
                    onChange={e => setFilterSeverity(e.target.value)}
                    className="select flex-1 text-xs py-1"
                  >
                    <option value="ALL">All Severities</option>
                    <option value="High">High ({metrics.high})</option>
                    <option value="Medium">Medium ({metrics.medium})</option>
                    <option value="Low">Low ({metrics.low})</option>
                  </select>

                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value)}
                    className="select flex-1 text-xs py-1"
                  >
                    <option value="ALL">All Categories</option>
                    <option value="Complexity">Complexity</option>
                    <option value="Maintainability">Maintainability</option>
                    <option value="Code Smells">Code Smells</option>
                    <option value="Architecture">Architecture</option>
                  </select>
                </div>
              </div>

              {/* Issues List */}
              <div className="flex-1 overflow-y-auto">
                {filteredFindings.map(finding => {
                  const isSelected = selectedFinding?.id === finding.id;
                  const fileShortName = finding.fileName.split('/').pop();
                  return (
                    <div
                      key={finding.id}
                      onClick={() => handleSelectFinding(finding)}
                      className={`p-3 border-b border-border cursor-pointer transition-colors ${
                        isSelected ? 'bg-accent/10 border-l-2 border-l-accent' : 'hover:bg-surface-hover border-l-2 border-l-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5">
                        <span className="text-[10px] text-muted font-mono uppercase tracking-wider">
                          {finding.category}
                        </span>
                        {getSeverityBadge(finding.severity)}
                      </div>

                      <div className={`font-medium text-xs mb-1.5 line-clamp-2 ${isSelected ? 'text-primary' : 'text-secondary'}`}>
                        {finding.title}
                      </div>

                      <div className="flex items-center gap-1.5 text-[11px] text-muted font-mono">
                        <FileCode size={11} />
                        <span className="truncate" title={finding.fileName}>
                          {fileShortName}:{finding.line}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {filteredFindings.length === 0 && (
                  <div className="p-8 text-center text-secondary text-sm">
                    <CheckCircle2 size={24} className="text-success mx-auto mb-2" />
                    <p>No issues matching your filters.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel: Finding Inspector */}
            <div className="flex-1 bg-bg overflow-y-auto flex flex-col">
              {selectedFinding ? (
                <div className="p-6 max-w-4xl mx-auto w-full flex flex-col gap-6">
                  {/* Header */}
                  <div className="flex justify-between items-start border-b border-border pb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        {getSeverityBadge(selectedFinding.severity)}
                        <span className="text-xs px-2 py-0.5 rounded-sm bg-surface-hover text-secondary font-mono border border-border">
                          {selectedFinding.category}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-primary m-0">{selectedFinding.title}</h3>
                    </div>

                    <div className="px-3 py-1.5 bg-surface rounded border border-border text-xs font-mono text-secondary flex items-center gap-2">
                      <FileCode size={14} className="text-muted" />
                      {selectedFinding.fileName}:{selectedFinding.line}
                    </div>
                  </div>

                  {/* Metric / Evidence Banner */}
                  <div className="p-3 rounded border border-accent/30 bg-accent/5 flex items-start gap-3">
                    <Flame size={16} className="text-accent mt-0.5" />
                    <div>
                      <div className="text-[10px] uppercase text-accent font-semibold tracking-wider mb-0.5">
                        Metric Evidence
                      </div>
                      <div className="text-sm font-medium text-primary">
                        {selectedFinding.metric}
                      </div>
                    </div>
                  </div>

                  {/* Code Context Preview */}
                  <div>
                    <div className="text-xs font-semibold text-secondary mb-2 flex items-center gap-2 uppercase tracking-wider">
                      <Code2 size={14} /> Code Context (Line {selectedFinding.line})
                    </div>
                    {loadingSnippet ? (
                      <div className="p-6 text-center text-muted text-sm border border-border rounded bg-surface">
                        Loading code snippet...
                      </div>
                    ) : fileSnippet ? (
                      <div className="font-mono text-xs bg-[#0d1117] rounded border border-border overflow-hidden">
                        {fileSnippet.content.split('\n').map((lineText, idx) => {
                          const currentLineNum = fileSnippet.startLine + idx;
                          const isTarget = currentLineNum === selectedFinding.line;
                          return (
                            <div 
                              key={idx}
                              className={`flex px-2 py-0.5 ${isTarget ? 'bg-error/15 border-l-2 border-error' : 'border-l-2 border-transparent hover:bg-white/5'}`}
                            >
                              <span className="w-10 text-right mr-4 text-muted select-none">
                                {currentLineNum}
                              </span>
                              <span className={`${isTarget ? 'text-white' : 'text-[#c9d1d9]'} whitespace-pre`}>
                                {lineText || ' '}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-3 rounded border border-border bg-surface text-secondary text-sm font-mono">
                        {selectedFinding.fileName}:{selectedFinding.line}
                      </div>
                    )}
                  </div>

                  {/* Description / Explanation */}
                  <div>
                    <div className="text-xs font-semibold text-secondary mb-2 uppercase tracking-wider">
                      Explanation
                    </div>
                    <div className="text-sm text-primary leading-relaxed bg-surface p-4 rounded border border-border">
                      {selectedFinding.description}
                    </div>
                  </div>

                  {/* Recommendation */}
                  <div>
                    <div className="text-xs font-semibold text-success mb-2 uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle2 size={14} /> Actionable Recommendation
                    </div>
                    <div className="text-sm text-success leading-relaxed bg-success/10 p-4 rounded border border-success/30">
                      {selectedFinding.recommendation}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-muted gap-3">
                  <HelpCircle size={48} className="opacity-20" />
                  <p className="text-sm">Select an issue from the list to view code context and metrics.</p>
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {status !== 'COMPLETED' && status !== 'NONE' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-bg text-center p-8">
          <RefreshCw size={32} className="text-accent animate-spin mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">Static Analysis in Progress</h3>
          <p className="text-secondary text-sm max-w-md mx-auto">
            Analyzing Java AST structures, calculating cyclomatic complexity, nesting depth, and detecting architectural code smells.
          </p>
        </div>
      )}

      {status === 'NONE' && (
        <div className="flex-1 flex flex-col items-center justify-center bg-bg text-center p-8">
          <ShieldAlert size={48} className="text-muted mb-4" />
          <h3 className="text-lg font-medium text-primary mb-2">No Static Analysis Run Yet</h3>
          <p className="text-secondary text-sm max-w-md mx-auto mb-6">
            Execute deterministic checks on this codebase to find complexity hotspots, maintainability bottlenecks, and architectural code smells.
          </p>
          <Button onClick={startAnalysis} className="btn-primary">
            Run Static Analysis
          </Button>
        </div>
      )}

    </div>
  );
}
