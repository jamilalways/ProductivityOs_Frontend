import axios from 'axios';

const api = axios.create({ baseURL: '/api', timeout: 15000 });

// Attach JWT from Zustand persisted store
api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('auth');
  if (raw) {
    const { state } = JSON.parse(raw);
    if (state?.token) config.headers.Authorization = `Bearer ${state.token}`;
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;
