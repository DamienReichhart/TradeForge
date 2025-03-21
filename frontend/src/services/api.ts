import axios from 'axios';

// Get the API URL from environment variable with fallback
const API_URL = process.env.REACT_APP_API_URL || 'http://api.tradeforge.apextradelogic.com:11101/api/v1';
console.log('API URL: ', API_URL);

// Base API instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Ensure trailing slashes for endpoints that need them
    if (config.url && config.url.startsWith('/bots') && !config.url.endsWith('/') && !config.url.includes('/', 5)) {
      config.url = `${config.url}/`;
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

// Add this configuration to axios defaults to ensure redirects maintain auth headers
axios.defaults.maxRedirects = 5;
axios.defaults.validateStatus = function (status) {
  return status >= 200 && status < 500; // Resolve only if status is 2xx or 3xx or 4xx
};

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
  delete: (id: number) => api.delete(`/bots/${id}`),
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