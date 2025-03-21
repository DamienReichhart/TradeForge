import axios from 'axios';

// Use environment variable:
const API_BASE_URL = process.env.REACT_APP_API_URL;
console.log('API URL: ', API_BASE_URL);

// Base API instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  // Configure axios to follow redirects and maintain the original HTTP method
  maxRedirects: 5,
  // This ensures DELETE/PUT methods are preserved during redirects
  validateStatus: function (status) {
    return status >= 200 && status < 500; // Resolve only if status is 2xx/3xx/4xx
  }
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure trailing slashes for endpoints that need them
    if (config.url && config.url.startsWith('/bots')) {
      // For paths like /bots/ (collection endpoint)
      if (config.url === '/bots' && !config.url.endsWith('/')) {
        config.url = `${config.url}/`;
      }
      
      // For paths with IDs like /bots/123 (excluding paths with further segments like /bots/123/start)
      if (config.url.match(/^\/bots\/\d+$/) && !config.url.endsWith('/')) {
        config.url = `${config.url}/`;
      }
    }
    console.log('Request:', config.method, config.url, config);
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('Response:', response.status, response.config.url, response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.config?.url, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Authentication
export const authApi = {
  login: (username: string, password: string) => 
    api.post('/auth/login', 
      new URLSearchParams({
        'username': username,
        'password': password
      }),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    ),
  register: (userData: any) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

// Bots
export const botsApi = {
  getAll: () => api.get('/bots/'),
  getById: (id: number) => api.get(`/bots/${id}`),
  create: (botData: any) => api.post('/bots/', botData),
  update: (id: number, botData: any) => api.put(`/bots/${id}`, botData),
  delete: (id: number) => {
    // Ensure the URL ends with a trailing slash to avoid redirection
    const url = `/bots/${id}/`;
    console.log(`Making delete request to: ${url}`);
    return api.delete(url);
  },
  start: (id: number) => api.post(`/bots/${id}/start`),
  stop: (id: number) => api.post(`/bots/${id}/stop`),
  getPerformance: (id: number) => api.get(`/bots/${id}/performance`),
};

// Indicators
export const indicatorsApi = {
  getAll: () => api.get('/indicators/'),
  getById: (id: number) => api.get(`/indicators/${id}`),
  getAvailable: () => api.get('/indicators/available'),
};

// Backtests
export const backtestsApi = {
  getAll: () => api.get('/backtests'),
  getById: (id: number) => api.get(`/backtests/${id}`),
  create: (backtestData: any) => api.post('/backtests', backtestData),
  delete: (id: number) => api.delete(`/backtests/${id}`),
};

// Performance
export const performanceApi = {
  getSummary: () => api.get('/performance'),
  getTrades: (params?: any) => api.get('/performance/trades', { params }),
  getBotsComparison: () => api.get('/performance/bots/comparison'),
};

// Marketing content
export const marketingApi = {
  getTutorials: () => api.get('/marketing/tutorials'),
  getTutorial: (slug: string) => api.get(`/marketing/tutorials/${slug}`),
  getOpinions: () => api.get('/marketing/opinions'),
};

export default api; 