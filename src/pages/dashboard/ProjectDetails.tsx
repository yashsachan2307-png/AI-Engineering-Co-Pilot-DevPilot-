import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { FileExplorer, RepositoryFile } from './components/FileExplorer';
import { CodeViewer } from './components/CodeViewer';
import { API_BASE_URL } from '../../services/api';

import { CodeIntelligenceDashboard } from './components/CodeIntelligenceDashboard';
import { CodeQualityDashboard } from './components/CodeQualityDashboard';
import { CodeReviewPage } from './reviews/CodeReviewPage';
import { Play, Loader2, FolderGit2, BrainCircuit, ShieldCheck, MessageSquareCode, TerminalSquare, SearchCode } from 'lucide-react';
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
      const res = await fetch(`${API_BASE_URL}/api/repositories/${id}/ingestion-status`, {
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
      const res = await fetch(`${API_BASE_URL}/api/repositories/${id}/files`, {
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
      const res = await fetch(`${API_BASE_URL}/api/repositories/${id}/ingest`, {
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
      const res = await fetch(`${API_BASE_URL}/api/repositories/${id}/files/${file.id}`, {
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
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', backgroundColor: 'var(--color-bg)' }}>
      
      {/* Top Context Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
            <FolderGit2 size={16} />
            <span>WORKSPACE_ROOT</span>
          </div>
          
          <div style={{ height: 16, width: 1, backgroundColor: 'var(--color-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-primary)', fontFamily: 'var(--font-code)', fontSize: '12px' }}>
            {id}
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ fontFamily: 'var(--font-code)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--color-text-muted)' }}>STATUS:</span>
            {status === 'COMPLETED' ? (
              <span className="text-success" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><ShieldCheck size={12}/> [READY]</span>
            ) : status === 'QUEUED' || status === 'PROCESSING' ? (
              <span className="text-warning" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Loader2 size={12} className="animate-spin" /> [INDEXING]</span>
            ) : (
              <span className="text-secondary">[UNINDEXED]</span>
            )}
          </div>
          
          <Button 
            onClick={startIngestion}
            disabled={status === 'QUEUED' || status === 'PROCESSING'}
            className={status === 'QUEUED' || status === 'PROCESSING' ? 'btn-ghost' : 'btn-primary'}
            style={{ fontFamily: 'var(--font-code)', fontSize: '11px' }}
          >
            {status === 'QUEUED' || status === 'PROCESSING' ? (
              <><Loader2 size={12} className="animate-spin" /> PROCESSING...</>
            ) : (
              <><Play size={12} /> INIT_INGESTION</>
            )}
          </Button>
        </div>
      </div>

      {/* Tabs / Tools */}
      {status === 'COMPLETED' && (
        <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '0 16px', flexShrink: 0 }}>
          <button 
            onClick={() => setActiveTab('FILES')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', 
              backgroundColor: activeTab === 'FILES' ? 'var(--color-bg)' : 'transparent',
              borderTop: `2px solid ${activeTab === 'FILES' ? 'var(--color-accent)' : 'transparent'}`,
              color: activeTab === 'FILES' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderRight: '1px solid var(--color-border)',
              borderLeft: '1px solid var(--color-border)',
              borderBottom: activeTab === 'FILES' ? 'none' : '1px solid var(--color-border)',
              fontFamily: 'var(--font-code)', fontSize: '11px', cursor: 'pointer', outline: 'none'
            }}
            className="hover:text-[var(--color-text-primary)]"
          >
            <FolderGit2 size={14} /> FILES.EXE
          </button>
          <button 
            onClick={() => setActiveTab('INTELLIGENCE')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', 
              backgroundColor: activeTab === 'INTELLIGENCE' ? 'var(--color-bg)' : 'transparent',
              borderTop: `2px solid ${activeTab === 'INTELLIGENCE' ? 'var(--color-accent)' : 'transparent'}`,
              color: activeTab === 'INTELLIGENCE' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderRight: '1px solid var(--color-border)',
              borderBottom: activeTab === 'INTELLIGENCE' ? 'none' : '1px solid var(--color-border)',
              fontFamily: 'var(--font-code)', fontSize: '11px', cursor: 'pointer', outline: 'none'
            }}
            className="hover:text-[var(--color-text-primary)]"
          >
            <BrainCircuit size={14} /> AST_ANALYSIS
          </button>
          <button 
            onClick={() => setActiveTab('QUALITY')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', 
              backgroundColor: activeTab === 'QUALITY' ? 'var(--color-bg)' : 'transparent',
              borderTop: `2px solid ${activeTab === 'QUALITY' ? 'var(--color-accent)' : 'transparent'}`,
              color: activeTab === 'QUALITY' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderRight: '1px solid var(--color-border)',
              borderBottom: activeTab === 'QUALITY' ? 'none' : '1px solid var(--color-border)',
              fontFamily: 'var(--font-code)', fontSize: '11px', cursor: 'pointer', outline: 'none'
            }}
            className="hover:text-[var(--color-text-primary)]"
          >
            <ShieldCheck size={14} /> CODE_QUALITY
          </button>
          <button 
            onClick={() => setActiveTab('REVIEW')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', 
              backgroundColor: activeTab === 'REVIEW' ? 'var(--color-bg)' : 'transparent',
              borderTop: `2px solid ${activeTab === 'REVIEW' ? 'var(--color-accent)' : 'transparent'}`,
              color: activeTab === 'REVIEW' ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
              borderRight: '1px solid var(--color-border)',
              borderBottom: activeTab === 'REVIEW' ? 'none' : '1px solid var(--color-border)',
              fontFamily: 'var(--font-code)', fontSize: '11px', cursor: 'pointer', outline: 'none'
            }}
            className="hover:text-[var(--color-text-primary)]"
          >
            <MessageSquareCode size={14} /> AI_REVIEW
          </button>
          <div style={{ flex: 1, borderBottom: '1px solid var(--color-border)' }} />
        </div>
      )}
      
      {/* Content Area */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {status === 'COMPLETED' && activeTab === 'FILES' && (
          <div style={{ display: 'flex', flex: 1, backgroundColor: 'var(--color-bg)' }}>
            <div style={{ width: '300px', backgroundColor: 'var(--color-surface)', flexShrink: 0, overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRight: '1px solid var(--color-border)' }}>
              <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--color-border)', fontSize: '11px', fontFamily: 'var(--font-code)', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SearchCode size={12} /> EXPLORER
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
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)', gap: '8px', fontFamily: 'var(--font-code)', fontSize: '12px' }}>
                    <Loader2 size={16} className="animate-spin" /> LOADING_BUFFER...
                  </div>
                ) : (
                  <CodeViewer 
                    fileName={selectedFile.name} 
                    language={selectedFile.language} 
                    content={fileContent} 
                  />
                )
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)', gap: '16px' }}>
                  <TerminalSquare size={48} style={{ opacity: 0.2 }} />
                  <div style={{ fontSize: '12px' }}>Awaiting file selection...</div>
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
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', minWidth: '300px' }}>
              <Loader2 size={24} className="animate-spin text-accent" />
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-code)' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>INGESTION_IN_PROGRESS</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Parsing syntax trees and generating embeddings...</div>
              </div>
            </div>
          </div>
        )}
        
        {status === 'NONE' && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '32px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '24px', minWidth: '350px' }}>
              <FolderGit2 size={32} className="text-muted" />
              <div style={{ textAlign: 'center', fontFamily: 'var(--font-code)' }}>
                <div style={{ fontSize: '13px', color: 'var(--color-text-primary)', marginBottom: '8px' }}>REPOSITORY_NOT_INDEXED</div>
                <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', lineHeight: '1.5' }}>Codebase must be ingested into the vector database<br/>before AI tools can be used.</div>
              </div>
              <Button onClick={startIngestion} className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontFamily: 'var(--font-code)', fontSize: '11px' }}>
                <Play size={14} /> INIT_INGESTION
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
