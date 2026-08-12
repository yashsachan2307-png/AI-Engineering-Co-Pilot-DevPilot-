export interface CodeGenerationResult {
  code: string;
  explanation: string;
}

export class CodeService {
  async generateCode(projectId: string, prompt: string): Promise<CodeGenerationResult> {
    throw new Error('Not implemented');
  }
}
export const codeService = new CodeService();
