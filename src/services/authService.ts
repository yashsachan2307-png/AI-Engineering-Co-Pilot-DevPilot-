// Placeholder for future Spring Boot backend connection
export interface User {
  id: string;
  email: string;
  name: string;
}

export class AuthService {
  async login(email: string, password: string):Promise<User> {
    throw new Error('Not implemented');
  }
  
  async signup(email: string, password: string, name: string):Promise<User> {
    throw new Error('Not implemented');
  }
  
  async logout():Promise<void> {
    throw new Error('Not implemented');
  }
}
export const authService = new AuthService();
