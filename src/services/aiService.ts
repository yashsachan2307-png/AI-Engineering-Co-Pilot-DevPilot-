import { API_BASE_URL } from './api';

export interface RagSourceCitation {
  path: string;
  startLine: number;
  endLine: number;
  symbol: string;
  method?: string;
  language: string;
  snippet: string;
  score: number;
}

export interface RagQueryResponse {
  answer: string;
  sources: RagSourceCitation[];
}

export interface AIConversation {
  id: number;
  repositoryId: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIMessage {
  id: number;
  conversationId: number;
  role: 'user' | 'assistant' | 'tool';
  content: string;
  toolCallsJson?: string;
  createdAt: string;
}

export class AIService {
  private getAuthHeaders(token?: string): HeadersInit {
    const activeToken = token || localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(activeToken ? { Authorization: `Bearer ${activeToken}` } : {}),
    };
  }

  async startIndexing(repositoryId: number | string, token?: string): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/rag/index`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to start indexing' }));
      throw new Error(err.error || 'Failed to start indexing');
    }
    return res.json();
  }

  async getIndexStatus(repositoryId: number | string, token?: string): Promise<{ status: string }> {
    const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/rag/status`, {
      headers: this.getAuthHeaders(token),
    });
    if (!res.ok) {
      return { status: 'NONE' };
    }
    return res.json();
  }

  async queryRepository(repositoryId: number | string, query: string, token?: string): Promise<RagQueryResponse> {
    const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/rag/query`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ query }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Failed to query codebase' }));
      throw new Error(err.error || 'Failed to query codebase');
    }
    return res.json();
  }

  // Phase 10: Agent Endpoints
  async createConversation(repositoryId: number | string, title: string, token?: string): Promise<AIConversation> {
    const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/conversations`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ title }),
    });
    if (!res.ok) throw new Error('Failed to create conversation');
    return res.json();
  }

  async getConversations(repositoryId: number | string, token?: string): Promise<AIConversation[]> {
    const res = await fetch(`${API_BASE_URL}/api/repositories/${repositoryId}/conversations`, {
      headers: this.getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch conversations');
    return res.json();
  }

  async getMessages(conversationId: number | string, token?: string): Promise<AIMessage[]> {
    const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
      headers: this.getAuthHeaders(token),
    });
    if (!res.ok) throw new Error('Failed to fetch messages');
    return res.json();
  }

  async sendMessage(conversationId: number | string, content: string, token?: string): Promise<AIMessage[]> {
    const res = await fetch(`${API_BASE_URL}/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ content }),
    });
    if (!res.ok) throw new Error('Failed to send message');
    return res.json();
  }
}

export const aiService = new AIService();
