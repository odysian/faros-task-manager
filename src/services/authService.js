import api from '../api';

export const authService = {
  // Authentication
  login: (credentials) => api.post('/auth/login', credentials),
  register: (data) => api.post('/auth/register', data),

  // Password Reset
  requestPasswordReset: (email) =>
    api.post('/auth/password-reset/request', { email }),

  resetPassword: (data) => api.post('/auth/password-reset/verify', data),

  // Email Verification
  sendVerificationEmail: () => api.post('/notifications/send-verification'),
  verifyEmailToken: (token) => api.post('/notifications/verify', { token }),
};
