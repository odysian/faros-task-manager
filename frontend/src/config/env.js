const LOCAL_API_URL = 'http://localhost:8000';
const rawApiUrl = import.meta.env.VITE_API_URL?.trim();
const isLocalRuntime =
  import.meta.env.DEV ||
  ['localhost', '127.0.0.1', '0.0.0.0'].includes(window.location.hostname);

function normalizeBaseUrl(url) {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}

function resolveApiBaseUrl() {
  if (rawApiUrl) {
    return normalizeBaseUrl(rawApiUrl);
  }

  if (isLocalRuntime) {
    return LOCAL_API_URL;
  }

  throw new Error(
    'Missing VITE_API_URL. Set VITE_API_URL in your frontend environment configuration.'
  );
}

export const API_BASE_URL = resolveApiBaseUrl();

export function buildApiUrl(path = '') {
  if (!path) {
    return API_BASE_URL;
  }

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
