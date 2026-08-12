export interface AIChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIService {
  async sendMessage(projectId: string, message: string): Promise<AIChatMessage> {
    throw new Error('Not implemented');
  }
}
export const aiService = new AIService();
