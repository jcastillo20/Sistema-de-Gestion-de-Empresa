import { API_CONFIG } from '../constants';

export class BaseService<T> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  protected async request(method: string, path: string = '', body?: any) {
    if (API_CONFIG.USE_MOCK) {
      return this.mockRequest(method, path, body);
    }

    const url = `${API_CONFIG.BASE_URL}/${this.endpoint}${path}`;
    const response = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) throw new Error('API Error');
    return response.json();
  }

  // To be implemented by specific services for mock data
  protected mockRequest(method: string, path: string, body?: any): Promise<any> {
    console.log(`Mock ${method} to ${this.endpoint}${path}`, body);
    return Promise.resolve([]);
  }

  getAll() { return this.request('GET'); }
  getById(id: string) { return this.request('GET', `/${id}`); }
  create(data: T) { return this.request('POST', '', data); }
  update(id: string, data: T) { return this.request('PUT', `/${id}`, data); }
  delete(id: string) { return this.request('DELETE', `/${id}`); }
}
