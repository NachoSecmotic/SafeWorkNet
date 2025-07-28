const API_URL = window._env_.REACT_APP_API_URL || 'http://localhost:3001';
const ENDPOINTS = {
  videoStreams: 'videoStreams',
  aiModels: 'aiModels',
  aiModelsRepository: 'aiModelsRepository',
  notifications: 'notifications',
  history: 'history',
  devices: 'devices',
  minio: 'minio',
};

export { API_URL, ENDPOINTS };
