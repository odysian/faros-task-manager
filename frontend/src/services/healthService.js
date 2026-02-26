import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://54.80.178.193:8000';
const WARMUP_TIMEOUT_MS = 5000;

export const healthService = {
  warmUpBackend: ({ signal } = {}) =>
    axios.get('/health', {
      baseURL: API_URL,
      signal,
      timeout: WARMUP_TIMEOUT_MS,
      headers: {
        'Cache-Control': 'no-cache',
        Pragma: 'no-cache',
        Expires: '0',
      },
      params: { _ts: Date.now() },
      validateStatus: () => true,
    }),
};
