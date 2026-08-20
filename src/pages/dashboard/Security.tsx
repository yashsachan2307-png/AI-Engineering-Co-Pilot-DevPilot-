import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { securityService, SecurityFinding } from '../../services/securityService';
import { Button } from '../../components/ui/Button';
import { 
  ShieldAlert, ShieldCheck, AlertTriangle, 
  AlertCircle, Info, RefreshCw, XCircle, 
  CheckCircle, Play, Eye, FolderGit2,
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
      const res = await fetch(`${API_BASE_URL}/api/repositories`, {
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
      <div style={{ display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--color-bg)', color: 'var(--color-text-secondary)', flexDirection: 'column', gap: '16px' }}>
        <ShieldAlert size={64} className="text-muted" style={{ opacity: 0.5 }} />
        <p style={{ fontSize: '13px', fontFamily: 'var(--font-code)' }}>NO_REPOSITORY_CONFIGURED</p>
      </div>
    );
  }

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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-error)', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
            <TerminalSquare size={16} />
            <span>SECURITY_ANALYZER</span>
          </div>
          
          <div style={{ height: 16, width: 1, backgroundColor: 'var(--color-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)' }}>
            <FolderGit2 size={12} className="text-muted" />
            <select
              value={currentRepositoryId || ''}
              onChange={(e) => setCurrentRepositoryId(Number(e.target.value))}
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
              {repositories.map(r => (
                <option key={r.id} value={r.id} style={{ background: 'var(--color-surface)' }}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Button 
            className="btn-primary"
            style={{ fontSize: '11px', fontFamily: 'var(--font-code)', padding: '6px 12px' }}
            onClick={handleScan}
            disabled={loading}
          >
            {loading ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : <Play size={14} className="mr-1.5" />}
            EXECUTE_SCAN
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Sidebar: Findings List */}
        <div style={{ width: '33%', display: 'flex', flexDirection: 'column', flexShrink: 0, backgroundColor: 'var(--color-surface)', borderRight: '1px solid var(--color-border)' }}>
          {/* Severity Summary */}
          <div style={{ display: 'flex', padding: '12px', gap: '8px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)', flexShrink: 0 }}>
            <div style={{ flex: 1, backgroundColor: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-error)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>CRITICAL</div>
              <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)', marginTop: '4px' }}>{critical}</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.2)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-warning)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>HIGH</div>
              <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)', marginTop: '4px' }}>{high}</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.2)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-accent)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>MED</div>
              <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)', marginTop: '4px' }}>{medium}</div>
            </div>
            <div style={{ flex: 1, backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.2)', borderRadius: 'var(--radius-sm)', padding: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '10px', color: 'var(--color-success)', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>LOW</div>
              <div style={{ fontSize: '16px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)', marginTop: '4px' }}>{low}</div>
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {findings.length === 0 && !loading && (
              <div style={{ padding: '32px', textAlign: 'center', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <ShieldCheck size={48} style={{ opacity: 0.5, marginBottom: '12px', color: 'var(--color-success)' }} />
                <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }}>NO_SECURITY_FINDINGS</p>
                <p style={{ fontSize: '11px', marginTop: '4px', fontFamily: 'var(--font-code)' }}>Run a scan to check the repository.</p>
              </div>
            )}
            
            {findings.map(finding => (
              <div 
                key={finding.id}
                onClick={() => setSelectedFinding(finding)}
                style={{
                  padding: '12px',
                  borderBottom: '1px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  backgroundColor: selectedFinding?.id === finding.id ? 'var(--color-surface-hover)' : 'transparent',
                  borderLeft: `2px solid ${selectedFinding?.id === finding.id ? 'var(--color-accent)' : 'transparent'}`,
                  opacity: finding.status !== 'NEW' ? 0.6 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '8px', fontFamily: 'var(--font-code)' }}>{finding.ruleId}</div>
                  {finding.severity === 'CRITICAL' && <AlertTriangle size={14} className="text-error" style={{ flexShrink: 0 }} />}
                  {finding.severity === 'HIGH' && <AlertTriangle size={14} className="text-warning" style={{ flexShrink: 0 }} />}
                  {finding.severity === 'MEDIUM' && <AlertCircle size={14} className="text-accent" style={{ flexShrink: 0 }} />}
                  {finding.severity === 'LOW' && <Info size={14} className="text-success" style={{ flexShrink: 0 }} />}
                </div>
                <div style={{ fontSize: '10px', color: 'var(--color-text-secondary)', marginTop: '4px', fontFamily: 'var(--font-code)' }}>LINE {finding.lineNumber ?? 'N/A'}</div>
                <div style={{ fontSize: '10px', fontFamily: 'var(--font-code)', color: 'var(--color-text-muted)', marginTop: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', backgroundColor: 'var(--color-bg)', padding: '6px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-border)' }}>
                  {finding.evidence}
                </div>
                {finding.status !== 'NEW' && (
                  <div style={{ fontSize: '10px', color: 'var(--color-success)', marginTop: '8px', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: 'var(--font-code)' }}>{finding.status}</div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Main Content: Finding Details */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
          {selectedFinding ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <h1 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>{selectedFinding.ruleId}</h1>
                    <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginTop: '4px', margin: 0, fontFamily: 'var(--font-code)' }}>CATEGORY: {selectedFinding.category}</p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
                    <Button 
                      className="btn-secondary"
                      style={{ fontSize: '10px', fontFamily: 'var(--font-code)', padding: '4px 10px', height: '28px', backgroundColor: 'rgba(34, 197, 94, 0.1)', borderColor: 'var(--color-success)', color: 'var(--color-success)' }}
                      onClick={() => handleUpdateStatus('REVIEWED')}
                    >
                      <CheckCircle size={12} style={{ marginRight: '4px' }} /> REVIEWED
                    </Button>
                    <Button 
                      className="btn-secondary"
                      style={{ fontSize: '10px', fontFamily: 'var(--font-code)', padding: '4px 10px', height: '28px' }}
                      onClick={() => handleUpdateStatus('DISMISSED')}
                    >
                      <XCircle size={12} style={{ marginRight: '4px' }} /> DISMISS
                    </Button>
                  </div>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)' }}>
                  <div style={{ backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
                      <h3 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', margin: 0, fontFamily: 'var(--font-code)' }}>MASKED_EVIDENCE (LINE {selectedFinding.lineNumber ?? 'N/A'})</h3>
                      <span style={{ fontSize: '10px', backgroundColor: 'rgba(239, 68, 68, 0.2)', color: 'var(--color-error)', padding: '2px 6px', borderRadius: '4px', border: '1px solid rgba(239, 68, 68, 0.3)', letterSpacing: '0.05em', fontFamily: 'var(--font-code)' }}>
                        SECRETS_MASKED
                      </span>
                    </div>
                    <SyntaxHighlighter
                      language="java"
                      style={vscDarkPlus}
                      customStyle={{ margin: 0, padding: '16px', fontSize: '11px', fontFamily: 'var(--font-code)', background: 'transparent' }}
                    >
                      {selectedFinding.evidence}
                    </SyntaxHighlighter>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 4px' }}>
                <h3 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)', margin: 0, fontFamily: 'var(--font-code)' }}>ANALYSIS_AND_REMEDIATION</h3>
                <Button
                  className="btn-primary"
                  style={{ fontSize: '11px', fontFamily: 'var(--font-code)', padding: '6px 12px' }}
                  onClick={handleExplain}
                  disabled={explaining}
                >
                  {explaining ? <RefreshCw size={14} className="animate-spin mr-1.5" /> : <Eye size={14} className="mr-1.5" />}
                  EXECUTE_AI_ANALYSIS
                </Button>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ padding: '16px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', margin: 0, fontFamily: 'var(--font-code)' }}>EXPLANATION</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: '8px 0 0 0', fontFamily: 'var(--font-code)' }}>{selectedFinding.explanation}</p>
                </div>
                
                <div style={{ padding: '16px', backgroundColor: 'rgba(56, 189, 248, 0.05)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: 'var(--radius-sm)' }}>
                  <h4 style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-accent)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px', margin: 0, fontFamily: 'var(--font-code)' }}>RECOMMENDATION</h4>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap', lineHeight: '1.6', margin: '8px 0 0 0', fontFamily: 'var(--font-code)' }}>{selectedFinding.recommendation}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', border: '1px dashed var(--color-border)', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--color-surface)', opacity: 0.8, minHeight: '400px' }}>
              <ShieldAlert size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
              <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)' }}>SELECT_FINDING_TO_INSPECT</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
