import axios from 'axios';

// Base API instance
const api = axios.create({
  baseURL: '/api/v1', // Use the proxy setup in package.json
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Authentication
export const authApi = {
  login: (username: string, password: string) => 
    api.post('/auth/login', { username, password }, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    }),
  register: (userData: any) => api.post('/auth/register', userData),
  me: () => api.get('/auth/me'),
};

// Bots
export const botsApi = {
  getAll: () => api.get('/bots'),
  getById: (id: number) => api.get(`/bots/${id}`),
  create: (botData: any) => api.post('/bots', botData),
  update: (id: number, botData: any) => api.put(`/bots/${id}`, botData),
  delete: (id: number) => api.delete(`/bots/${id}`),
  start: (id: number) => api.post(`/bots/${id}/start`),
  stop: (id: number) => api.post(`/bots/${id}/stop`),
  getPerformance: (id: number) => api.get(`/bots/${id}/performance`),
};

// Indicators
export const indicatorsApi = {
  getAll: () => api.get('/indicators'),
  getById: (id: number) => api.get(`/indicators/${id}`),
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