export interface DebugSession {
  id: string;
  status: 'active' | 'resolved';
}

export class DebugService {
  async startSession(projectId: string, errorTrace: string): Promise<DebugSession> {
    throw new Error('Not implemented');
  }
}
export const debugService = new DebugService();
