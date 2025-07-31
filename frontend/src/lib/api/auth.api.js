import { BaseApi } from './base.api.js';

export class AuthApi extends BaseApi {
  async login(email, password) {
    return this.post('/auth/login', { email, password });
  }

  async register(email, name, password, role = 'user') {
    return this.post('/auth/register', { email, name, password, role });
  }

  async getCurrentUser() {
    return this.get('/auth/me');
  }

  async logout() {
    return this.post('/auth/logout', {});
  }
}

export const authApi = new AuthApi();
