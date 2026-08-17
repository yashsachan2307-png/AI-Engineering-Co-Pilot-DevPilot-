import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileExplorer, RepositoryFile } from './components/FileExplorer';
import { CodeViewer } from './components/CodeViewer';

import { CodeIntelligenceDashboard } from './components/CodeIntelligenceDashboard';
import { CodeQualityDashboard } from './components/CodeQualityDashboard';
import { CodeReviewPage } from './reviews/CodeReviewPage';
import { Play, Loader2, Folder, BrainCircuit, ShieldCheck, MessageSquareCode } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export function ProjectDetails() {
  const { id } = useParams();
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'FILES' | 'INTELLIGENCE' | 'QUALITY' | 'REVIEW'>('FILES');
  const [status, setStatus] = useState<string>('NONE');
  const [files, setFiles] = useState<RepositoryFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<RepositoryFile | null>(null);
  const [fileContent, setFileContent] = useState<string>('');
  const [loadingContent, setLoadingContent] = useState(false);

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 3000);
    return () => clearInterval(interval);
  }, [id, token]);

  const fetchStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/repositories/${id}/ingestion-status`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.status) {
        setStatus(data.status);
        if (data.status === 'COMPLETED' && files.length === 0) {
          fetchFiles();
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchFiles = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/repositories/${id}/files`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFiles(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startIngestion = async () => {
    if (!token) return;
    try {
      const res = await fetch(`http://localhost:8080/api/repositories/${id}/ingest`, {
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

  const handleFileSelect = async (file: RepositoryFile) => {
    setSelectedFile(file);
    setLoadingContent(true);
    setFileContent('');
    try {
      const res = await fetch(`http://localhost:8080/api/repositories/${id}/files/${file.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setFileContent(data.content);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingContent(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h1 className="text-xl font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Folder className="text-accent" size={20} />
            {id}
          </h1>
          <p className="text-secondary text-sm mt-1">Repository Workspace</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div className="text-sm">
            <span className="text-muted mr-2">Status:</span>
            {status === 'COMPLETED' ? (
              <span className="text-success font-medium flex items-center gap-1"><ShieldCheck size={14}/> Ready</span>
            ) : status === 'QUEUED' || status === 'PROCESSING' ? (
              <span className="text-warning font-medium flex items-center gap-1"><Loader2 size={14} className="animate-spin" /> Indexing</span>
            ) : (
              <span className="text-secondary font-medium">Unindexed</span>
            )}
          </div>
          
          <Button 
            onClick={startIngestion}
            disabled={status === 'QUEUED' || status === 'PROCESSING'}
            className={status === 'QUEUED' || status === 'PROCESSING' ? 'btn-secondary' : 'btn-primary'}
          >
            {status === 'QUEUED' || status === 'PROCESSING' ? (
              <><Loader2 size={14} className="animate-spin" /> Ingesting...</>
            ) : (
              <><Play size={14} /> Start Ingestion</>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      {status === 'COMPLETED' && (
        <div style={{ display: 'flex', gap: '2px', borderBottom: '1px solid var(--color-border)', marginBottom: '16px', flexShrink: 0 }}>
          <button className={`tab ${activeTab === 'FILES' ? 'active' : ''}`} onClick={() => setActiveTab('FILES')}>
            <Folder size={14} /> File Explorer
          </button>
          <button className={`tab ${activeTab === 'INTELLIGENCE' ? 'active' : ''}`} onClick={() => setActiveTab('INTELLIGENCE')}>
            <BrainCircuit size={14} /> Code Intelligence
          </button>
          <button className={`tab ${activeTab === 'QUALITY' ? 'active' : ''}`} onClick={() => setActiveTab('QUALITY')}>
            <ShieldCheck size={14} /> Code Quality
          </button>
          <button className={`tab ${activeTab === 'REVIEW' ? 'active' : ''}`} onClick={() => setActiveTab('REVIEW')}>
            <MessageSquareCode size={14} /> AI Code Review
          </button>
        </div>
      )}
      
      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {status === 'COMPLETED' && activeTab === 'FILES' && (
          <div className="split-pane" style={{ flex: 1, gap: '1px', backgroundColor: 'var(--color-border)' }}>
            <div style={{ width: '280px', backgroundColor: 'var(--color-surface)', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--color-border)', fontSize: '11px', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Explorer
              </div>
              <div style={{ flex: 1, overflowY: 'auto' }}>
                <FileExplorer 
                  files={files} 
                  onFileSelect={handleFileSelect} 
                  selectedFileId={selectedFile?.id} 
                />
              </div>
            </div>
            
            <div style={{ flex: 1, backgroundColor: 'var(--color-bg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              {selectedFile ? (
                loadingContent ? (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', gap: '8px' }}>
                    <Loader2 size={16} className="animate-spin" /> Loading editor...
                  </div>
                ) : (
                  <CodeViewer 
                    fileName={selectedFile.name} 
                    language={selectedFile.language} 
                    content={fileContent} 
                  />
                )
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
                  Select a file from the explorer to view its contents
                </div>
              )}
            </div>
          </div>
        )}

        {status === 'COMPLETED' && activeTab === 'INTELLIGENCE' && (
          <CodeIntelligenceDashboard repositoryId={id || ''} />
        )}

        {status === 'COMPLETED' && activeTab === 'QUALITY' && (
          <CodeQualityDashboard repositoryId={id || ''} />
        )}

        {status === 'COMPLETED' && activeTab === 'REVIEW' && (
          <div style={{ flex: 1, overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
            <CodeReviewPage />
          </div>
        )}
        
        {status !== 'COMPLETED' && status !== 'NONE' && (
          <div className="card" style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center', padding: '32px' }}>
            <Loader2 size={32} className="animate-spin text-accent" style={{ margin: '0 auto 16px' }} />
            <h3 className="text-primary font-semibold text-lg mb-2">Ingestion in Progress</h3>
            <p className="text-secondary text-sm">We are downloading and parsing the repository files. This may take a few moments.</p>
          </div>
        )}
        
        {status === 'NONE' && (
          <div className="card" style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center', padding: '32px' }}>
            <Folder size={32} className="text-muted" style={{ margin: '0 auto 16px' }} />
            <h3 className="text-primary font-semibold text-lg mb-2">Repository Not Indexed</h3>
            <p className="text-secondary text-sm mb-6">This repository hasn't been ingested yet. Start the ingestion process to analyze the code.</p>
            <Button onClick={startIngestion} className="btn-primary w-full justify-center">
              <Play size={14} /> Start Ingestion
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
