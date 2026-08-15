import api from './api';

export interface FileProposal {
    path: string;
    oldCode?: string;
    newCode: string;
    explanation: string;
}

export interface GenerateResponse {
    proposals: FileProposal[];
    explanation: string;
}

export const generateCode = async (repositoryId: number, prompt: string): Promise<GenerateResponse> => {
    const response = await api.post(`/repositories/${repositoryId}/generate`, { prompt });
    return response.data;
};
