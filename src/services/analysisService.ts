export interface AnalysisResult {
  issues: string[];
  score: number;
}

export class AnalysisService {
  async runAnalysis(projectId: string): Promise<AnalysisResult> {
    throw new Error('Not implemented');
  }
}
export const analysisService = new AnalysisService();
