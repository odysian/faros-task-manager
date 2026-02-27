import axios from 'axios';
import { API_BASE_URL } from './config/env';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Broadcast auth expiration so App can reset view state.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const requestUrl = String(error.config?.url || '');
    const isPublicAuthRequest =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/register') ||
      requestUrl.includes('/auth/password-reset/');

    if (error.response?.status === 401 && !isPublicAuthRequest) {
      window.dispatchEvent(new CustomEvent('faros:unauthorized'));
    }
    return Promise.reject(error);
  }
);

export default api;
