import { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { useAnalysisProgress } from '../../../hooks/useAnalysisProgress';
import { API_BASE_URL } from '../../../services/api';

interface CodeSymbol {
  id: number;
  type: string;
  name: string;
  signature: string;
  startLine: number;
  endLine: number;
}

interface Metrics {
  classes?: number;
  interfaces?: number;
  methods?: number;
  fields?: number;
  imports?: number;
}

interface CodeIntelligenceDashboardProps {
  repositoryId: string;
}

export function CodeIntelligenceDashboard({ repositoryId }: CodeIntelligenceDashboardProps) {
  const { token } = useAuth();
  
  const [status, setStatus] = useState<string>('NONE');
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [symbols, setSymbols] = useState<CodeSymbol[]>([]);
  const [filterType, setFilterType] = useState<string>('');
  const [jobId, setJobId] = useState<number | undefined>();
  
  const { progress } = useAnalysisProgress(jobId ? parseInt(repositoryId) : undefined, jobId);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [repositoryId, token]);
  
  useEffect(() => {
    if (progress) {
      if (progress.status === 'COMPLETED' && status !== 'COMPLETED') {
        setStatus('COMPLETED');
        fetchMetrics();
        fetchSymbols();
      } else if (progress.status === 'FAILED') {
        setStatus('FAILED');
      }
    }
  }, [progress]);

  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/analysis`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
        if (data.id) setJobId(data.id);
        if (data.status === 'COMPLETED' && !metrics) {
          fetchMetrics();
          fetchSymbols();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchMetrics = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/metrics`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
  const fetchSymbols = async (type: string = '') => {
    if (!token) return;
    try {
      const url = `${API_BASE_URL}/api/repositories/${repositoryId}/symbols${type ? `?type=${type}` : ''}`;
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSymbols(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startAnalysis = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/analyze`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStatus('QUEUED');
        setJobId(data.id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFilterType(val);
    fetchSymbols(val);
  };

  if (status === 'NONE') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '16px' }}>Code Intelligence</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          This repository has not been analyzed yet. Start the AST-based intelligence analysis to extract code structures and metrics.
        </p>
        <button className="btn-primary" onClick={startAnalysis}>Analyze Repository</button>
      </div>
    );
  }

  if (status === 'QUEUED' || status === 'PROCESSING') {
    return (
      <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
        <h2 style={{ marginBottom: '16px' }}>Analyzing Repository...</h2>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: '20px' }}>Parsing AST structures and generating metrics. This may take a moment.</p>
        
        {progress && (
          <div style={{ marginTop: '20px', maxWidth: '400px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
              <span>{progress.step}</span>
              <span>{progress.percentage}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', backgroundColor: 'var(--color-border)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ 
                width: `${progress.percentage}%`, 
                height: '100%', 
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.3s ease-in-out'
              }} />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', height: '100%', overflow: 'hidden' }}>
      {/* Metrics Row */}
      {metrics && (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <MetricCard title="Classes" value={metrics.classes || 0} />
          <MetricCard title="Interfaces" value={metrics.interfaces || 0} />
          <MetricCard title="Methods" value={metrics.methods || 0} />
          <MetricCard title="Fields" value={metrics.fields || 0} />
          <MetricCard title="Imports" value={metrics.imports || 0} />
        </div>
      )}

      {/* Symbols Viewer */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-surface)', borderRadius: '8px', padding: '20px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0 }}>Code Symbols</h3>
          <select 
            value={filterType} 
            onChange={handleFilterChange}
            style={{ 
              padding: '6px 12px', 
              borderRadius: '4px',
              backgroundColor: 'var(--color-bg)',
              color: 'var(--color-text)',
              border: '1px solid var(--color-border)'
            }}
          >
            <option value="">All Types</option>
            <option value="CLASS">Classes</option>
            <option value="INTERFACE">Interfaces</option>
            <option value="METHOD">Methods</option>
            <option value="FIELD">Fields</option>
            <option value="IMPORT">Imports</option>
          </select>
        </div>

        <div style={{ flex: 1, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)', textAlign: 'left' }}>
                <th style={{ padding: '8px', width: '120px' }}>Type</th>
                <th style={{ padding: '8px' }}>Signature</th>
                <th style={{ padding: '8px', width: '100px', textAlign: 'right' }}>Lines</th>
              </tr>
            </thead>
            <tbody>
              {symbols.map(sym => (
                <tr key={sym.id} style={{ borderBottom: '1px solid var(--color-surface-hover)' }}>
                  <td style={{ padding: '8px' }}>
                    <span style={{ 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      backgroundColor: 'var(--color-bg)', 
                      fontSize: '0.8rem',
                      fontWeight: 500
                    }}>
                      {sym.type}
                    </span>
                  </td>
                  <td style={{ padding: '8px', fontFamily: 'monospace' }}>{sym.signature || sym.name}</td>
                  <td style={{ padding: '8px', textAlign: 'right', color: 'var(--color-text-secondary)' }}>
                    {sym.startLine ? `${sym.startLine}-${sym.endLine}` : '-'}
                  </td>
                </tr>
              ))}
              {symbols.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ padding: '20px', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
                    No symbols found for this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value }: { title: string, value: number }) {
  return (
    <div style={{ 
      flex: '1 1 150px',
      backgroundColor: 'var(--color-surface)', 
      padding: '16px', 
      borderRadius: '8px',
      border: '1px solid var(--color-border)',
      textAlign: 'center'
    }}>
      <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem', marginBottom: '8px' }}>{title}</div>
      <div style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--color-primary)' }}>{value}</div>
    </div>
  );
}
