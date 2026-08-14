import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { aiService, AIConversation, AIMessage } from '../../services/aiService';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { 
  Send, 
  Bot, 
  User, 
  FolderGit2, 
  Sparkles, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  HelpCircle,
  Wrench
} from 'lucide-react';

interface Repo {
  id: number;
  name: string;
  fullName: string;
}

const STARTER_PROMPTS = [
  "Where is JWT authentication configured?",
  "How does authentication work?",
  "Where is the database configured?",
  "How are users created?"
];

export function AIAssistant() {
  const { token } = useAuth();
  const [repositories, setRepositories] = useState<Repo[]>([]);
  const [selectedRepoId, setSelectedRepoId] = useState<number | null>(null);
  
  const [, setConversations] = useState<AIConversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<number | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  
  const [inputQuery, setInputQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [indexStatus, setIndexStatus] = useState<string>('NONE');
  const [isIndexing, setIsIndexing] = useState<boolean>(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchRepositories();
  }, []);

  useEffect(() => {
    if (selectedRepoId) {
      checkIndexStatus(selectedRepoId);
      fetchConversations(selectedRepoId);
    } else {
      setConversations([]);
      setMessages([]);
      setActiveConversationId(null);
    }
  }, [selectedRepoId]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    } else {
      setMessages([]);
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isQuerying]);

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

  const fetchConversations = async (repoId: number) => {
    try {
      const convs = await aiService.getConversations(repoId, token || undefined);
      setConversations(convs);
      if (convs.length > 0) {
        setActiveConversationId(convs[0].id);
      } else {
        setActiveConversationId(null);
      }
    } catch (e) {
      console.error('Failed to fetch conversations', e);
    }
  };

  const fetchMessages = async (convId: number) => {
    try {
      const msgs = await aiService.getMessages(convId, token || undefined);
      setMessages(msgs);
    } catch (e) {
      console.error('Failed to fetch messages', e);
    }
  };

  const checkIndexStatus = async (repoId: number) => {
    try {
      const res = await aiService.getIndexStatus(repoId, token || undefined);
      setIndexStatus(res.status || 'NONE');
      if (res.status === 'PROCESSING') {
        setIsIndexing(true);
        setTimeout(() => checkIndexStatus(repoId), 3000);
      } else {
        setIsIndexing(false);
      }
    } catch (e) {
      console.error('Failed to get index status', e);
    }
  };

  const handleStartIndexing = async () => {
    if (!selectedRepoId) return;
    setIsIndexing(true);
    try {
      await aiService.startIndexing(selectedRepoId, token || undefined);
      setIndexStatus('PROCESSING');
      setTimeout(() => checkIndexStatus(selectedRepoId), 2500);
    } catch (e: any) {
      alert(e.message || 'Failed to start indexing');
      setIsIndexing(false);
    }
  };

  const handleNewConversation = async () => {
    if (!selectedRepoId) return;
    try {
      const conv = await aiService.createConversation(selectedRepoId, "New Conversation", token || undefined);
      setConversations(prev => [conv, ...prev]);
      setActiveConversationId(conv.id);
    } catch (e) {
      console.error('Failed to create conversation', e);
    }
  };

  const handleSendMessage = async (queryText?: string) => {
    const text = (queryText || inputQuery).trim();
    if (!text || !selectedRepoId || isQuerying) return;
    
    let currentConvId = activeConversationId;
    if (!currentConvId) {
      // Auto-create conversation if none exists
      try {
        const conv = await aiService.createConversation(selectedRepoId, text.substring(0, 30) + "...", token || undefined);
        setConversations(prev => [conv, ...prev]);
        setActiveConversationId(conv.id);
        currentConvId = conv.id;
      } catch (e) {
        console.error('Failed to create conversation', e);
        return;
      }
    }

    const optimisticUserMsg: AIMessage = {
      id: Date.now(),
      conversationId: currentConvId,
      role: 'user',
      content: text,
      createdAt: new Date().toISOString(),
    };
    setMessages(prev => [...prev, optimisticUserMsg]);
    
    if (!queryText) setInputQuery('');
    setIsQuerying(true);

    try {
      const updatedMessages = await aiService.sendMessage(currentConvId, text, token || undefined);
      setMessages(updatedMessages);
    } catch (e: any) {
      const errorMsg: AIMessage = {
        id: Date.now() + 1,
        conversationId: currentConvId,
        role: 'assistant',
        content: `⚠️ **Error querying agent:** ${e.message}`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div style={{ height: 'calc(100vh - 5rem)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Sparkles size={24} style={{ color: 'var(--color-accent)' }} />
            AI Engineering Agent
          </h1>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
            Agentic repository analysis with tool usage and context gathering.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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

          <Button
            variant={indexStatus === 'COMPLETED' ? 'outline' : 'accent'}
            size="sm"
            onClick={handleStartIndexing}
            disabled={!selectedRepoId || isIndexing}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            {isIndexing ? (
              <><RefreshCw size={14} className="animate-spin" /> Indexing...</>
            ) : indexStatus === 'COMPLETED' ? (
              <><CheckCircle2 size={14} style={{ color: 'var(--color-success, #10b981)' }} /> Re-Index Codebase</>
            ) : (
              <><Database size={14} /> Index Codebase</>
            )}
          </Button>

          <Button variant="outline" size="sm" onClick={handleNewConversation} disabled={!selectedRepoId}>
            New Chat
          </Button>
        </div>
      </div>

      <Card style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg-secondary)' }}>
        <CardContent style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.length === 0 && !isQuerying && (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-secondary)' }}>
              <Bot size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
              <p>Start a conversation to see the agent in action.</p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'tool') return null; // Hide raw tool outputs for cleaner UI
            
            // Render tool call intention
            if (msg.role === 'assistant' && msg.toolCallsJson) {
              let toolName = "Unknown Tool";
              try {
                const parsed = JSON.parse(msg.toolCallsJson);
                toolName = parsed.tool || toolName;
              } catch (e) {}

              return (
                <div key={msg.id} style={{ display: 'flex', gap: '0.875rem', alignSelf: 'flex-start', maxWidth: '88%' }}>
                  <div style={{ width: '34px', flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-accent)', fontSize: '0.85rem', backgroundColor: 'rgba(99, 102, 241, 0.05)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <Wrench size={14} />
                    <span>Agent called tool: <strong>{toolName}</strong></span>
                  </div>
                </div>
              );
            }

            // Normal messages
            return (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '0.875rem',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: msg.role === 'user' ? '75%' : '88%',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0, marginTop: '2px' }}>
                    <Bot size={18} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', width: '100%' }}>
                  <div
                    style={{
                      backgroundColor: msg.role === 'user' ? 'var(--color-accent)' : 'var(--color-bg)',
                      color: msg.role === 'user' ? '#ffffff' : 'var(--color-text)',
                      padding: '0.875rem 1.125rem',
                      borderRadius: msg.role === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                      border: msg.role === 'user' ? 'none' : '1px solid var(--color-border)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                      lineHeight: '1.6',
                      fontSize: '0.925rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.content}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--color-text-secondary)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', marginTop: '2px' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', flexShrink: 0, marginTop: '2px' }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {isQuerying && (
            <div style={{ display: 'flex', gap: '0.875rem', alignSelf: 'flex-start' }}>
              <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
              <div style={{ backgroundColor: 'var(--color-bg)', padding: '0.875rem 1.125rem', borderRadius: '14px 14px 14px 2px', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                <RefreshCw size={14} className="animate-spin" />
                Agent is thinking and using tools...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </CardContent>

        <div style={{ padding: '0.5rem 1.25rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', gap: '0.5rem', overflowX: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem', whiteSpace: 'nowrap' }}>
            <HelpCircle size={12} /> Suggested:
          </span>
          {STARTER_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(prompt)}
              disabled={isQuerying || !selectedRepoId}
              style={{
                backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: '12px', padding: '0.25rem 0.65rem', fontSize: '0.75rem', color: 'var(--color-text)', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-accent)'; e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.08)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--color-border)'; e.currentTarget.style.backgroundColor = 'var(--color-bg-secondary)'; }}
            >
              {prompt}
            </button>
          ))}
        </div>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)', display: 'flex', gap: '0.75rem' }}>
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
            placeholder={!selectedRepoId ? "Select a repository first..." : "Ask the agent anything..."}
            disabled={!selectedRepoId || isQuerying}
            style={{ flex: 1, backgroundColor: 'var(--color-bg-secondary)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '0.625rem 0.875rem', color: 'var(--color-text)', fontSize: '0.875rem', outline: 'none' }}
          />
          <Button variant="accent" onClick={() => handleSendMessage()} disabled={!selectedRepoId || !inputQuery.trim() || isQuerying} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.125rem' }}>
            <Send size={16} />
            Ask AI
          </Button>
        </div>
      </Card>
    </div>
  );
}
