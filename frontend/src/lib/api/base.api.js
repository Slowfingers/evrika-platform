// Определяем API URL на основе окружения
const getApiBaseUrl = () => {
  // В production на Render используем фиксированный URL
  if (typeof window !== 'undefined' && window.location.hostname.includes('onrender.com')) {
    return 'https://evrika-backend.onrender.com/api';
  }
  // Локальная разработка
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

export class BaseApi {
  constructor(customFetch = null) {
    this.baseUrl = API_BASE_URL;
    this.fetch = customFetch || (typeof window !== 'undefined' ? window.fetch.bind(window) : fetch);
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
    };

    // Добавляем токен авторизации если есть
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token');
      if (token) {
        defaultOptions.headers.Authorization = `Bearer ${token}`;
      }
    }

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await this.fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  }

  async post(endpoint, data) {
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async put(endpoint, data) {
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  }
}
