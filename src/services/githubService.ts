import api from './api';

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  description: string;
  html_url: string;
  default_branch: string;
  language: string;
  visibility: string;
  updated_at: string;
}

export const githubService = {
  getConnectUrl: async () => {
    const response = await api.get('/github/connect');
    return response.data.url;
  },
  
  handleCallback: async (code: string) => {
    const response = await api.post('/github/callback', { code });
    return response.data;
  },

  getStatus: async () => {
    const response = await api.get('/github/status');
    return response.data;
  },

  getRepositories: async (): Promise<GitHubRepository[]> => {
    const response = await api.get('/github/repositories');
    return response.data;
  },

  importRepository: async (githubId: number) => {
    const response = await api.post('/repositories/import', { githubId });
    return response.data;
  }
};
