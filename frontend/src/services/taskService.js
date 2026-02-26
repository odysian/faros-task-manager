import api from '../api';

export const taskService = {
  // Tasks
  getTasks: (params, signal) => api.get('/tasks', { params, signal }),
  getSharedTasks: (signal) => api.get('/tasks/shared-with-me', { signal }),
  getStats: () => api.get('/tasks/stats'),
  createTask: (data) => api.post('/tasks', data),
  updateTask: (id, data) => api.patch(`/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/tasks/${id}`),

  // Comment
  getComments: (taskId) => api.get(`/tasks/${taskId}/comments`),
  addComment: (taskId, content) =>
    api.post(`/tasks/${taskId}/comments`, { content }),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`),
  updateComment: (commentId, content) =>
    api.patch(`/comments/${commentId}`, { content }),

  // File
  getFiles: (taskId) => api.get(`/tasks/${taskId}/files`),
  uploadFile: (taskId, formData, onProgress) =>
    api.post(`/tasks/${taskId}/files`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  downloadFile: (fileId) =>
    api.get(`/files/${fileId}`, { responseType: 'blob' }),
  deleteFile: (fileId) => api.delete(`/files/${fileId}`),

  // Sharing
  getShares: (taskId) => api.get(`/tasks/${taskId}/shares`),
  shareTask: (taskId, data) => api.post(`/tasks/${taskId}/share`, data),
  updateShare: (taskId, username, data) =>
    api.put(`/tasks/${taskId}/share/${username}`, data),
  revokeShare: (taskId, username) =>
    api.delete(`/tasks/${taskId}/share/${username}`),

  // Activity
  getTaskActivity: (taskId) => api.get(`/activity/tasks/${taskId}`),
  getGlobalActivity: () => api.get('/activity'),
};
