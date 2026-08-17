import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { aiService, AIConversation, AIMessage } from '../../services/aiService';
import { Button } from '../../components/ui/Button';
import { 
  Send, 
  Bot, 
  User, 
  FolderGit2, 
  RefreshCw, 
  Database, 
  CheckCircle2, 
  HelpCircle,
  Wrench,
  TerminalSquare
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
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexShrink: 0 }}>
        <div>
          <h1 className="text-xl font-semibold text-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TerminalSquare className="text-accent" size={20} />
            AI Workspace
          </h1>
          <p className="text-secondary text-sm mt-1">Context-aware engineering assistant</p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-surface)' }}>
            <FolderGit2 size={14} className="text-muted" />
            <select
              value={selectedRepoId || ''}
              onChange={(e) => setSelectedRepoId(Number(e.target.value))}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--color-text-primary)',
                fontSize: '12px',
                outline: 'none',
                cursor: 'pointer'
              }}
            >
              {repositories.length === 0 && <option value="">No repositories imported</option>}
              {repositories.map(r => (
                <option key={r.id} value={r.id} style={{ background: 'var(--color-surface)' }}>
                  {r.fullName || r.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            className={indexStatus === 'COMPLETED' ? 'btn-secondary' : 'btn-primary'}
            onClick={handleStartIndexing}
            disabled={!selectedRepoId || isIndexing}
          >
            {isIndexing ? (
              <><RefreshCw size={14} className="animate-spin" /> Indexing...</>
            ) : indexStatus === 'COMPLETED' ? (
              <><CheckCircle2 size={14} className="text-success" /> Re-Index</>
            ) : (
              <><Database size={14} /> Index</>
            )}
          </Button>

          <Button className="btn-secondary" onClick={handleNewConversation} disabled={!selectedRepoId}>
            New Chat
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="card" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {messages.length === 0 && !isQuerying && (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-muted)' }}>
              <Bot size={32} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
              <p className="text-sm">Start a conversation with the engineering agent.</p>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'tool') return null;
            
            if (msg.role === 'assistant' && msg.toolCallsJson) {
              let toolName = "Unknown Tool";
              try {
                const parsed = JSON.parse(msg.toolCallsJson);
                toolName = parsed.tool || toolName;
              } catch (e) {}

              return (
                <div key={msg.id} style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start', maxWidth: '85%' }}>
                  <div style={{ width: '28px', flexShrink: 0 }} />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', fontSize: '11px', padding: '6px 10px', borderLeft: '2px solid var(--color-accent)', backgroundColor: 'var(--color-surface)' }}>
                    <Wrench size={12} />
                    <span>Agent called tool: <strong>{toolName}</strong></span>
                  </div>
                </div>
              );
            }

            return (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                    <Bot size={14} />
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
                  <div
                    style={{
                      backgroundColor: msg.role === 'user' ? 'var(--color-surface)' : 'transparent',
                      color: 'var(--color-text-primary)',
                      padding: msg.role === 'user' ? '12px 16px' : '0 12px',
                      border: msg.role === 'user' ? '1px solid var(--color-border)' : 'none',
                      borderRadius: 'var(--radius-sm)',
                      lineHeight: '1.6',
                      fontSize: '13px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word'
                    }}
                  >
                    {msg.content}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', padding: '0 12px' }}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.role === 'user' && (
                  <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text-secondary)', flexShrink: 0 }}>
                    <User size={14} />
                  </div>
                )}
              </div>
            );
          })}

          {isQuerying && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <div style={{ width: '28px', height: '28px', backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-accent)', flexShrink: 0 }}>
                <Bot size={14} />
              </div>
              <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '12px' }}>
                <RefreshCw size={12} className="animate-spin" />
                Agent is thinking...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-bg)' }}>
          <div style={{ padding: '8px 16px', display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}>
              <HelpCircle size={10} /> Suggested:
            </span>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isQuerying || !selectedRepoId}
                style={{
                  backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: '4px', padding: '4px 8px', fontSize: '11px', color: 'var(--color-text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap'
                }}
                className="hover:bg-[var(--color-border)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div style={{ padding: '12px 16px', display: 'flex', gap: '12px', backgroundColor: 'var(--color-surface)' }}>
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder={!selectedRepoId ? "Select a repository first..." : "Ask the agent anything..."}
              disabled={!selectedRepoId || isQuerying}
              className="form-input"
              style={{ flex: 1 }}
            />
            <Button className="btn-primary" onClick={() => handleSendMessage()} disabled={!selectedRepoId || !inputQuery.trim() || isQuerying}>
              <Send size={14} /> Ask
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
