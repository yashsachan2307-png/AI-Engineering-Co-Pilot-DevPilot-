export interface Project {
  id: string;
  name: string;
  description?: string;
  status: 'Planning' | 'Active' | 'Archived';
}

export class ProjectService {
  async listProjects(): Promise<Project[]> {
    throw new Error('Not implemented');
  }
  
  async getProject(id: string): Promise<Project> {
    throw new Error('Not implemented');
  }
  
  async createProject(data: Partial<Project>): Promise<Project> {
    throw new Error('Not implemented');
  }
}
export const projectService = new ProjectService();
