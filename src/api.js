import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://54.80.178.193:8000';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to every request if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
