import axios from 'axios';
import { API_BASE_URL } from '../config/env';

const WARMUP_TIMEOUT_MS = 5000;

export const healthService = {
  warmUpBackend: ({ signal } = {}) =>
    axios.get('/health', {
      baseURL: API_BASE_URL,
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
