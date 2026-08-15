import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { securityService, SecurityFinding } from '../../services/securityService';
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
      <div className="flex h-full items-center justify-center bg-gray-900 text-gray-400 flex-col gap-4">
        <ShieldAlert className="w-16 h-16 text-gray-700" />
        <p>No repository selected. Please ensure you have imported a repository.</p>
      </div>
    );
  }

  return (
    <div className="flex h-full bg-gray-900 text-white overflow-hidden">
      {/* Sidebar: Findings List */}
      <div className="w-1/3 border-r border-gray-700 flex flex-col">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center bg-gray-800">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <ShieldAlert className="text-red-500" /> Security
          </h2>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-gray-900 px-2 py-1 rounded border border-gray-700">
              <FolderGit2 className="w-4 h-4 text-gray-400" />
              <select
                value={currentRepositoryId || ''}
                onChange={(e) => setCurrentRepositoryId(Number(e.target.value))}
                className="bg-transparent text-sm text-gray-200 outline-none border-none cursor-pointer"
              >
                {repositories.map(r => (
                  <option key={r.id} value={r.id} className="bg-gray-800">
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <button 
              onClick={handleScan}
              disabled={loading}
              className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm flex items-center gap-1 transition-colors disabled:opacity-50"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Scan
            </button>
          </div>
        </div>

        {/* Severity Summary */}
        <div className="flex p-4 gap-2 border-b border-gray-700 bg-gray-850">
          <div className="flex-1 bg-red-900/30 border border-red-800 rounded p-2 text-center">
            <div className="text-xs text-red-400 uppercase font-bold">Critical</div>
            <div className="text-xl text-red-100">{critical}</div>
          </div>
          <div className="flex-1 bg-orange-900/30 border border-orange-800 rounded p-2 text-center">
            <div className="text-xs text-orange-400 uppercase font-bold">High</div>
            <div className="text-xl text-orange-100">{high}</div>
          </div>
          <div className="flex-1 bg-yellow-900/30 border border-yellow-800 rounded p-2 text-center">
            <div className="text-xs text-yellow-400 uppercase font-bold">Med</div>
            <div className="text-xl text-yellow-100">{medium}</div>
          </div>
          <div className="flex-1 bg-blue-900/30 border border-blue-800 rounded p-2 text-center">
            <div className="text-xs text-blue-400 uppercase font-bold">Low</div>
            <div className="text-xl text-blue-100">{low}</div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {findings.length === 0 && !loading && (
            <div className="p-8 text-center text-gray-500 flex flex-col items-center">
              <ShieldCheck className="w-12 h-12 text-green-500 mb-2" />
              <p>No security findings.</p>
              <p className="text-sm">Run a scan to check the repository.</p>
            </div>
          )}
          
          {findings.map(finding => (
            <div 
              key={finding.id}
              onClick={() => setSelectedFinding(finding)}
              className={`p-4 border-b border-gray-700 cursor-pointer hover:bg-gray-800 transition-colors ${selectedFinding?.id === finding.id ? 'bg-gray-800 border-l-4 border-l-blue-500' : ''} ${finding.status !== 'NEW' ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="font-semibold text-gray-200">{finding.ruleId}</div>
                {finding.severity === 'CRITICAL' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                {finding.severity === 'HIGH' && <AlertTriangle className="w-4 h-4 text-orange-500" />}
                {finding.severity === 'MEDIUM' && <AlertCircle className="w-4 h-4 text-yellow-500" />}
                {finding.severity === 'LOW' && <Info className="w-4 h-4 text-blue-500" />}
              </div>
              <div className="text-xs text-gray-400 mt-1">Line {finding.lineNumber ?? 'N/A'}</div>
              <div className="text-xs font-mono text-gray-500 mt-2 truncate bg-gray-900 p-1 rounded border border-gray-800">
                {finding.evidence}
              </div>
              {finding.status !== 'NEW' && (
                <div className="text-xs text-green-400 mt-2 font-bold">{finding.status}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content: Finding Details */}
      <div className="w-2/3 flex flex-col bg-gray-900">
        {selectedFinding ? (
          <>
            <div className="p-6 border-b border-gray-700">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h1 className="text-2xl font-bold">{selectedFinding.ruleId}</h1>
                  <p className="text-gray-400 mt-1">Category: {selectedFinding.category}</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleUpdateStatus('REVIEWED')}
                    className="flex items-center gap-1 px-3 py-1 bg-green-900/50 text-green-400 border border-green-800 rounded hover:bg-green-800 transition-colors"
                  >
                    <CheckCircle className="w-4 h-4" /> Reviewed
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus('DISMISSED')}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-800 text-gray-400 border border-gray-700 rounded hover:bg-gray-700 transition-colors"
                  >
                    <XCircle className="w-4 h-4" /> Dismiss
                  </button>
                </div>
              </div>
              
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-bold text-gray-300">Masked Evidence (Line {selectedFinding.lineNumber ?? 'N/A'})</h3>
                  <span className="text-xs bg-red-900/30 text-red-400 px-2 py-1 rounded border border-red-800">
                    Secrets automatically masked
                  </span>
                </div>
                <SyntaxHighlighter
                  language="java"
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, borderRadius: '0.375rem', backgroundColor: '#0f172a' }}
                >
                  {selectedFinding.evidence}
                </SyntaxHighlighter>
              </div>

              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Analysis & Remediation</h3>
                <button
                  onClick={handleExplain}
                  disabled={explaining}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors disabled:opacity-50"
                >
                  {explaining ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Eye className="w-4 h-4" />}
                  Ask AI to Analyze
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-400 mb-2 uppercase">Explanation</h4>
                  <p className="text-gray-200 whitespace-pre-wrap">{selectedFinding.explanation}</p>
                </div>
                
                <div className="bg-blue-900/20 border border-blue-900 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-400 mb-2 uppercase">Recommendation</h4>
                  <p className="text-gray-200 whitespace-pre-wrap">{selectedFinding.recommendation}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <ShieldAlert className="w-16 h-16 mb-4 text-gray-700" />
            <p>Select a finding to view details</p>
          </div>
        )}
      </div>
    </div>
  );
};
