import api from '../api';

export const userService = {
  // Profile Management
  getProfile: () => api.get('/users/me'),
  updateProfile: (data) => api.patch('/users/me', data),
  updateAvatar: (formData) => api.post('/users/me/avatar', formData),

  // Security (Authenticated)
  changePassword: (data) => api.patch('/users/me/change-password', data),

  // Discovery
  searchUsers: (query) => api.get('/users/search', { params: { query } }),

  // Preferences
  getPreferences: () => api.get('/notifications/preferences'),
  updatePreferences: (preferences) =>
    api.patch('/notifications/preferences', preferences),
};
