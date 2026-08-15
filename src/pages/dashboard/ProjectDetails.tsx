import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileExplorer, RepositoryFile } from './components/FileExplorer';
import { CodeViewer } from './components/CodeViewer';

import { CodeIntelligenceDashboard } from './components/CodeIntelligenceDashboard';
import { CodeQualityDashboard } from './components/CodeQualityDashboard';
import { CodeReviewPage } from './reviews/CodeReviewPage';

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

  const tabStyle = (isActive: boolean) => ({
    padding: '8px 16px',
    cursor: 'pointer',
    borderBottom: isActive ? '2px solid var(--color-primary)' : '2px solid transparent',
    color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)',
    fontWeight: isActive ? 600 : 400
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Project Details: {id}</h1>
        <div>
          <span style={{ marginRight: '1rem', fontSize: '0.9rem', color: 'var(--color-text-secondary)' }}>
            Ingestion Status: {status}
          </span>
          <button 
            onClick={startIngestion}
            disabled={status === 'QUEUED' || status === 'PROCESSING'}
            className="btn-primary"
            style={{ 
              padding: '8px 16px', 
              backgroundColor: status === 'QUEUED' || status === 'PROCESSING' ? '#666' : 'var(--color-primary)',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: status === 'QUEUED' || status === 'PROCESSING' ? 'not-allowed' : 'pointer'
            }}
          >
            {status === 'QUEUED' || status === 'PROCESSING' ? 'Ingesting...' : 'Ingest Repository'}
          </button>
        </div>
      </div>

      {status === 'COMPLETED' && (
        <div style={{ display: 'flex', gap: '20px', borderBottom: '1px solid var(--color-border)', marginBottom: '20px', flexShrink: 0 }}>
          <div style={tabStyle(activeTab === 'FILES')} onClick={() => setActiveTab('FILES')}>
            File Explorer
          </div>
          <div style={tabStyle(activeTab === 'INTELLIGENCE')} onClick={() => setActiveTab('INTELLIGENCE')}>
            Code Intelligence
          </div>
          <div style={tabStyle(activeTab === 'QUALITY')} onClick={() => setActiveTab('QUALITY')}>
            Code Quality
          </div>
          <div style={tabStyle(activeTab === 'REVIEW')} onClick={() => setActiveTab('REVIEW')}>
            AI Code Review
          </div>
        </div>
      )}
      
      {status === 'COMPLETED' && activeTab === 'FILES' && (
        <div style={{ display: 'flex', flex: 1, gap: '20px', overflow: 'hidden' }}>
          <div style={{ 
            width: '250px', 
            flexShrink: 0, 
            borderRight: '1px solid var(--color-border)', 
            paddingRight: '10px',
            overflow: 'hidden'
          }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', marginBottom: '10px', textTransform: 'uppercase' }}>Explorer</h3>
            <FileExplorer 
              files={files} 
              onFileSelect={handleFileSelect} 
              selectedFileId={selectedFile?.id} 
            />
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            {selectedFile ? (
              loadingContent ? (
                <div style={{ padding: '20px', color: 'var(--color-text-secondary)' }}>Loading content...</div>
              ) : (
                <CodeViewer 
                  fileName={selectedFile.name} 
                  language={selectedFile.language} 
                  content={fileContent} 
                />
              )
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
                Select a file to view its content
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
        <div style={{ flex: 1, overflow: 'auto', backgroundColor: '#f9fafb' }}>
          <CodeReviewPage />
        </div>
      )}
      
      {status !== 'COMPLETED' && status !== 'NONE' && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
          <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>Ingestion in Progress</div>
          <p>We are downloading and parsing the repository files. This may take a few moments.</p>
        </div>
      )}
      
      {status === 'NONE' && (
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--color-text-secondary)', backgroundColor: 'var(--color-surface)', borderRadius: '8px' }}>
          <p>This repository hasn't been ingested yet. Click "Ingest Repository" to start.</p>
        </div>
      )}
    </div>
  );
}
