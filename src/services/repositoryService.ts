export interface Repository {
  id: string;
  url: string;
  branch: string;
}

export class RepositoryService {
  async connectRepository(projectId: string, url: string): Promise<Repository> {
    throw new Error('Not implemented');
  }
  
  async syncRepository(repoId: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
export const repositoryService = new RepositoryService();
