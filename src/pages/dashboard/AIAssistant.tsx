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
  TerminalSquare,
  ChevronRight
} from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

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
      const res = await fetch(`${API_BASE_URL}/api/repositories`, {
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
        content: `[ERROR] Failed to query intelligence engine: ${e.message}`,
        createdAt: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsQuerying(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg)' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-accent)', fontFamily: 'var(--font-code)', fontSize: '13px' }}>
            <TerminalSquare size={16} />
            <span>AI_ASSISTANT_SESSION</span>
          </div>
          
          <div style={{ height: 16, width: 1, backgroundColor: 'var(--color-border)' }} />
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 8px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--color-bg)' }}>
            <FolderGit2 size={12} className="text-muted" />
            <select
              value={selectedRepoId || ''}
              onChange={(e) => setSelectedRepoId(Number(e.target.value))}
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
              {repositories.length === 0 && <option value="">NO_REPOSITORIES</option>}
              {repositories.map(r => (
                <option key={r.id} value={r.id} style={{ background: 'var(--color-surface)' }}>
                  {r.fullName || r.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Button
            className={indexStatus === 'COMPLETED' ? 'btn-ghost' : 'btn-secondary'}
            onClick={handleStartIndexing}
            disabled={!selectedRepoId || isIndexing}
            style={{ fontFamily: 'var(--font-code)', fontSize: '11px' }}
          >
            {isIndexing ? (
              <><RefreshCw size={12} className="animate-spin" /> INDEXING...</>
            ) : indexStatus === 'COMPLETED' ? (
              <><CheckCircle2 size={12} className="text-success" /> RE-INDEX</>
            ) : (
              <><Database size={12} /> INDEX_REPO</>
            )}
          </Button>

          <Button className="btn-secondary" onClick={handleNewConversation} disabled={!selectedRepoId} style={{ fontFamily: 'var(--font-code)', fontSize: '11px' }}>
            + NEW_SESSION
          </Button>
        </div>
      </div>

      {/* Terminal View Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.length === 0 && !isQuerying && (
            <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <TerminalSquare size={48} style={{ opacity: 0.2 }} />
              <div>
                <div style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>ENGINEERING_AGENT_READY</div>
                <div style={{ fontSize: '12px' }}>Awaiting instruction input...</div>
              </div>
            </div>
          )}

          {messages.map((msg) => {
            if (msg.role === 'tool') return null;
            
            if (msg.role === 'assistant' && msg.toolCallsJson) {
              let toolName = "UnknownTool";
              try {
                const parsed = JSON.parse(msg.toolCallsJson);
                toolName = parsed.tool || toolName;
              } catch (e) {}

              return (
                <div key={msg.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)', fontSize: '11px', paddingLeft: '24px' }}>
                  <Wrench size={12} />
                  <span>[EXEC] Invoking external tool: {toolName}()</span>
                </div>
              );
            }

            return (
              <div 
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignSelf: 'stretch',
                  paddingBottom: '20px',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <div style={{ flexShrink: 0, marginTop: '2px' }}>
                  {msg.role === 'assistant' ? (
                    <Bot size={16} className="text-accent" />
                  ) : (
                    <ChevronRight size={16} className="text-secondary" />
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 600, fontFamily: 'var(--font-code)', color: msg.role === 'user' ? 'var(--color-text-secondary)' : 'var(--color-accent)' }}>
                      {msg.role === 'user' ? 'USER' : 'AGENT'}
                    </span>
                    <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-code)' }}>
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <div
                    style={{
                      color: msg.role === 'user' ? 'var(--color-text-primary)' : 'var(--color-text-primary)',
                      lineHeight: '1.6',
                      fontSize: '13px',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontFamily: msg.role === 'user' ? 'var(--font-code)' : 'var(--font-ui)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })}

          {isQuerying && (
            <div style={{ display: 'flex', gap: '12px', alignSelf: 'flex-start' }}>
              <Bot size={16} className="text-accent" style={{ marginTop: '2px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-secondary)', fontSize: '12px', fontFamily: 'var(--font-code)' }}>
                <RefreshCw size={12} className="animate-spin" />
                PROCESSING_QUERY...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ borderTop: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)', padding: '16px 24px' }}>
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-code)', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <HelpCircle size={10} /> SUGGESTIONS:
            </span>
            {STARTER_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isQuerying || !selectedRepoId}
                style={{
                  backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', padding: '4px 8px', fontSize: '11px', color: 'var(--color-text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: 'var(--font-code)'
                }}
                className="hover:border-[var(--color-border-hover)] hover:text-[var(--color-text-primary)] transition-colors"
              >
                {prompt}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, backgroundColor: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-sm)', display: 'flex', padding: '2px' }}>
              <div style={{ padding: '10px 8px', color: 'var(--color-text-muted)' }}>
                <ChevronRight size={14} />
              </div>
              <textarea
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                placeholder={!selectedRepoId ? "SELECT REPOSITORY TO BEGIN" : "Enter instruction or query..."}
                disabled={!selectedRepoId || isQuerying}
                style={{ 
                  flex: 1, 
                  background: 'transparent', 
                  border: 'none', 
                  color: 'var(--color-text-primary)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-code)',
                  padding: '8px 8px 8px 0',
                  outline: 'none',
                  minHeight: '40px',
                  resize: 'none'
                }}
                rows={1}
              />
            </div>
            <Button className="btn-primary" onClick={() => handleSendMessage()} disabled={!selectedRepoId || !inputQuery.trim() || isQuerying} style={{ height: '44px', fontFamily: 'var(--font-code)' }}>
              <Send size={14} /> EXECUTE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

