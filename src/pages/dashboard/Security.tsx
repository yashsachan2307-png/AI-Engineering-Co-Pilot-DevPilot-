import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { securityService, SecurityFinding } from '../../services/securityService';
import { Button } from '../../components/ui/Button';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, 
  AlertCircle, Info, RefreshCw, XCircle, 
  CheckCircle, Play, Eye, FolderGit2
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface Repo {
  id: number;
  name: string;
  fullName: string;
}

export const Security: React.FC = () => {
  const { token } = useAuth();
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [currentRepositoryId, setCurrentRepositoryId] = useState<number | null>(null);

  const [findings, setFindings] = useState<SecurityFinding[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedFinding, setSelectedFinding] = useState<SecurityFinding | null>(null);
  const [explaining, setExplaining] = useState(false);
  
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
        if (data.length > 0 && !currentRepositoryId) setCurrentRepositoryId(data[0].id);
      }
    } catch (e) {
      console.error('Failed to load repositories', e);
    }
  };

  const fetchFindings = async () => {
    if (!currentRepositoryId) return;
    setLoading(true);
    try {
      const response = await securityService.getFindings(currentRepositoryId);
      setFindings(response.findings || []);
      setSelectedFinding(null);
    } catch (error) {
      console.error("Failed to fetch findings", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (currentRepositoryId) {
      fetchFindings();
    }
  }, [currentRepositoryId]);

  const handleScan = async () => {
    if (!currentRepositoryId) return;
    setLoading(true);
    try {
      const response = await securityService.scanRepository(currentRepositoryId);
      setFindings(response.findings || []);
      setSelectedFinding(null);
    } catch (error) {
      console.error("Failed to scan", error);
    }
    setLoading(false);
  };

  const handleExplain = async () => {
    if (!currentRepositoryId || !selectedFinding) return;
    setExplaining(true);
    try {
      const response = await securityService.explainFinding(currentRepositoryId, selectedFinding.id);
      setSelectedFinding({
        ...selectedFinding,
        explanation: response.explanation,
        recommendation: response.recommendation
      });
    } catch (error) {
      console.error("Failed to explain finding", error);
    }
    setExplaining(false);
  };

  const handleUpdateStatus = async (status: 'REVIEWED' | 'DISMISSED' | 'IGNORED') => {
    if (!currentRepositoryId || !selectedFinding) return;
    try {
      const updated = await securityService.updateStatus(currentRepositoryId, selectedFinding.id, status);
      setSelectedFinding(updated);
      setFindings(findings.map(f => f.id === updated.id ? updated : f));
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  const activeFindings = findings.filter(f => f.status === 'NEW');
  const critical = activeFindings.filter(f => f.severity === 'CRITICAL').length;
  const high = activeFindings.filter(f => f.severity === 'HIGH').length;
  const medium = activeFindings.filter(f => f.severity === 'MEDIUM').length;
  const low = activeFindings.filter(f => f.severity === 'LOW').length;

  if (!currentRepositoryId) {
    return (
      <div className="flex h-full items-center justify-center bg-bg text-secondary flex-col gap-4">
        <ShieldAlert className="w-16 h-16 text-muted" />
        <p className="text-sm">No repository selected. Please ensure you have imported a repository.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 h-full bg-bg overflow-hidden">
      <div className="panel border-b-0 border-l-0 border-r-0 rounded-none flex justify-between items-center px-4 py-3 shrink-0 bg-surface">
        <div>
          <h1 className="text-sm font-semibold text-primary flex items-center gap-2 m-0">
            <ShieldAlert size={16} className="text-error" />
            Security Analysis
          </h1>
          <p className="text-xs text-secondary mt-1 m-0">
            Scan and remediate security vulnerabilities in your codebase.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-surface-hover border border-border rounded-sm">
            <FolderGit2 size={14} className="text-muted" />
            <select
              value={currentRepositoryId || ''}
              onChange={(e) => setCurrentRepositoryId(Number(e.target.value))}
              className="select text-xs py-0.5 border-none bg-transparent pl-0 focus:ring-0 w-48"
            >
              {repositories.map(r => (
                <option key={r.id} value={r.id} className="bg-surface text-primary">
                  {r.name}
                </option>
              ))}
            </select>
          </div>
          <Button 
            className="btn-primary text-xs py-1"
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : <Play size={14} className="mr-1.5" />}
            Scan
          </Button>
        </div>
      </div>

      <div className="flex flex-1 gap-4 overflow-hidden">
        {/* Sidebar: Findings List */}
        <div className="panel w-1/3 flex flex-col shrink-0 bg-surface border-l-0 border-r border-t border-b-0 rounded-none">
          {/* Severity Summary */}
          <div className="flex p-3 gap-2 border-b border-border bg-surface-hover shrink-0">
            <div className="flex-1 bg-error/10 border border-error/20 rounded p-2 text-center">
              <div className="text-[10px] text-error uppercase font-bold tracking-wider">Critical</div>
              <div className="text-lg text-primary font-mono mt-1">{critical}</div>
            </div>
            <div className="flex-1 bg-warning/10 border border-warning/20 rounded p-2 text-center">
              <div className="text-[10px] text-warning uppercase font-bold tracking-wider">High</div>
              <div className="text-lg text-primary font-mono mt-1">{high}</div>
            </div>
            <div className="flex-1 bg-accent/10 border border-accent/20 rounded p-2 text-center">
              <div className="text-[10px] text-accent uppercase font-bold tracking-wider">Med</div>
              <div className="text-lg text-primary font-mono mt-1">{medium}</div>
            </div>
            <div className="flex-1 bg-success/10 border border-success/20 rounded p-2 text-center">
              <div className="text-[10px] text-success uppercase font-bold tracking-wider">Low</div>
              <div className="text-lg text-primary font-mono mt-1">{low}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {findings.length === 0 && !loading && (
              <div className="p-8 text-center text-muted flex flex-col items-center">
                <ShieldCheck size={48} className="text-success/50 mb-3" />
                <p className="text-sm text-primary">No security findings.</p>
                <p className="text-xs mt-1">Run a scan to check the repository.</p>
              </div>
            )}
            
            {findings.map(finding => (
              <div 
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                className={`p-3 border-b border-border cursor-pointer transition-colors ${selectedFinding?.id === finding.id ? 'bg-surface-hover border-l-2 border-l-accent' : 'hover:bg-surface-hover border-l-2 border-l-transparent'} ${finding.status !== 'NEW' ? 'opacity-60' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div className="text-xs font-semibold text-primary truncate mr-2">{finding.ruleId}</div>
                  {finding.severity === 'CRITICAL' && <AlertTriangle size={14} className="text-error shrink-0" />}
                  {finding.severity === 'HIGH' && <AlertTriangle size={14} className="text-warning shrink-0" />}
                  {finding.severity === 'MEDIUM' && <AlertCircle size={14} className="text-accent shrink-0" />}
                  {finding.severity === 'LOW' && <Info size={14} className="text-success shrink-0" />}
                </div>
                <div className="text-[10px] text-secondary mt-1">Line {finding.lineNumber ?? 'N/A'}</div>
                <div className="text-[10px] font-mono text-muted mt-2 truncate bg-[#0f172a] p-1.5 rounded border border-border">
                  {finding.evidence}
                </div>
                {finding.status !== 'NEW' && (
                  <div className="text-[10px] text-success mt-2 font-bold tracking-wider uppercase">{finding.status}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Finding Details */}
        <div className="flex-1 overflow-y-auto pr-4 pb-4">
          {selectedFinding ? (
            <div className="flex flex-col gap-4">
              <div className="panel bg-surface">
                <div className="px-4 py-3 border-b border-border flex justify-between items-start gap-4">
                  <div>
                    <h1 className="text-base font-bold text-primary m-0">{selectedFinding.ruleId}</h1>
                    <p className="text-xs text-secondary mt-1 m-0">Category: {selectedFinding.category}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button 
                      className="btn-secondary text-[11px] px-2.5 py-1 h-7 border-success text-success bg-success/10"
                      onClick={() => handleUpdateStatus('REVIEWED')}
                    >
                      <CheckCircle size={12} className="mr-1" /> Reviewed
                    </Button>
                    <Button 
                      className="btn-secondary text-[11px] px-2.5 py-1 h-7"
                      onClick={() => handleUpdateStatus('DISMISSED')}
                    >
                      <XCircle size={12} className="mr-1" /> Dismiss
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-surface">
                  <div className="bg-[#0f172a] border border-border rounded-lg overflow-hidden">
                    <div className="flex justify-between items-center px-4 py-2 border-b border-border/50 bg-[#0f172a]/50">
                      <h3 className="text-[11px] font-semibold text-secondary m-0">Masked Evidence (Line {selectedFinding.lineNumber ?? 'N/A'})</h3>
                      <span className="text-[10px] bg-error/20 text-error px-1.5 py-0.5 rounded border border-error/30 tracking-wider">
                        Secrets masked
                      </span>
                    </div>
                    <SyntaxHighlighter
                      language="java"
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, padding: '16px', fontSize: '11px', background: 'transparent' }}
                    >
                      {selectedFinding.evidence}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center px-1">
                <h3 className="text-sm font-semibold text-primary m-0">Analysis & Remediation</h3>
                <Button
                  className="btn-primary text-xs py-1"
                  onClick={handleExplain}
                  disabled={explaining}
                >
                  {explaining ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : <Eye size={14} className="mr-1.5" />}
                  Ask AI to Analyze
                </Button>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="panel p-4 bg-surface">
                  <h4 className="text-[11px] font-semibold text-secondary uppercase tracking-wider mb-2 m-0">Explanation</h4>
                  <p className="text-xs text-primary whitespace-pre-wrap leading-relaxed m-0">{selectedFinding.explanation}</p>
                </div>
                
                <div className="panel p-4 bg-accent/5 border-accent/30">
                  <h4 className="text-[11px] font-semibold text-accent uppercase tracking-wider mb-2 m-0">Recommendation</h4>
                  <p className="text-xs text-primary whitespace-pre-wrap leading-relaxed m-0">{selectedFinding.recommendation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-muted border border-dashed border-border rounded-lg bg-surface/50 min-h-[400px]">
              <ShieldAlert size={48} className="opacity-30 mb-4" />
              <p className="text-sm text-primary">Select a finding to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
