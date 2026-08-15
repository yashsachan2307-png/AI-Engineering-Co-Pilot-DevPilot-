import axios from 'axios';
import { getAuthToken } from './authService';

export interface GraphNode {
    id: string;
    name: string;
    type: string;
    inDegree: number;
    outDegree: number;
    metrics: string[];
}

export interface GraphEdge {
    source: string;
    target: string;
    type: string;
}

export interface ArchitectureAnalysis {
    nodes: GraphNode[];
    edges: GraphEdge[];
    circularDependencies: string[];
    highlyCoupledModules: string[];
}

export interface ArchitectureExplainResponse {
    explanation: string;
}

export const getArchitecture = async (repositoryId: number): Promise<ArchitectureAnalysis> => {
    const response = await axios.get(`/api/repositories/${repositoryId}/architecture`, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`
        }
    });
    return response.data;
};

export const explainArchitecture = async (repositoryId: number, nodeId: string, question: string, contextGraph: ArchitectureAnalysis): Promise<ArchitectureExplainResponse> => {
    const response = await axios.post(`/api/repositories/${repositoryId}/architecture/explain`, {
        nodeId,
        question,
        contextGraph
    }, {
        headers: {
            Authorization: `Bearer ${getAuthToken()}`
        }
    });
    return response.data;
};
