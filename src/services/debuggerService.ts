import api from './api';

export interface DebugRequest {
  errorMessage: string;
  stackTrace: string;
  selectedFile?: string;
  userDescription?: string;
}

export interface DebugResponse {
  rootCause: string;
  evidence: string;
  relevantFiles: string[];
  likelyCauses: string[];
  suggestedFix: string;
  potentialSideEffects: string;
  prevention: string;
}

export const debuggerService = {
  async debugError(repositoryId: number, request: DebugRequest, token?: string): Promise<DebugResponse> {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await api.post(`/repositories/${repositoryId}/debug`, request, { headers });
    return response.data;
  }
};
