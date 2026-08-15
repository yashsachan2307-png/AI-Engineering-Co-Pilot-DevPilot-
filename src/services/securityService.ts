import api from './api';

export interface SecurityFinding {
  id: number;
  repositoryId: number;
  fileId: number;
  ruleId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  category: string;
  lineNumber?: number;
  evidence: string;
  explanation: string;
  recommendation: string;
  status: 'NEW' | 'REVIEWED' | 'DISMISSED' | 'IGNORED';
  createdAt: string;
  updatedAt: string;
}

export interface SecurityScanResponse {
  findings: SecurityFinding[];
}

export interface SecurityExplainResponse {
  explanation: string;
  recommendation: string;
}

export const securityService = {
  getFindings: async (repositoryId: number): Promise<SecurityScanResponse> => {
    const response = await api.get(`/repositories/${repositoryId}/security`);
    return response.data;
  },

  scanRepository: async (repositoryId: number): Promise<SecurityScanResponse> => {
    const response = await api.post(`/repositories/${repositoryId}/security/scan`);
    return response.data;
  },

  explainFinding: async (repositoryId: number, findingId: number): Promise<SecurityExplainResponse> => {
    const response = await api.post(`/repositories/${repositoryId}/security/findings/${findingId}/explain`);
    return response.data;
  },

  updateStatus: async (repositoryId: number, findingId: number, status: string): Promise<SecurityFinding> => {
    const response = await api.put(`/repositories/${repositoryId}/security/findings/${findingId}/status`, { status });
    return response.data;
  }
};
