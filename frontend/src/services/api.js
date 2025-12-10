import axios from 'axios';

const API_URL = '/api';

// Get token from localStorage
const getToken = () => localStorage.getItem('token');

// Set token in axios headers
const setAuthToken = (token) => {
  if (token) {
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    localStorage.setItem('token', token);
  } else {
    delete axios.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
  }
};

// Initialize token if exists
const token = getToken();
if (token) {
  setAuthToken(token);
}

// Auth API
export const authAPI = {
  register: async (name, email, password) => {
    const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
    setAuthToken(response.data.token);
    return response.data;
  },
  
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    setAuthToken(response.data.token);
    return response.data;
  },
  
  logout: () => {
    setAuthToken(null);
  },
  
  getCurrentUser: async () => {
    const response = await axios.get(`${API_URL}/auth/me`);
    return response.data;
  }
};

// Files API
export const filesAPI = {
  upload: async (file, onProgress) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await axios.post(`${API_URL}/files/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(percentCompleted);
        }
      }
    });
    return response.data;
  },
  
  getFiles: async () => {
    const response = await axios.get(`${API_URL}/files`);
    return response.data;
  },
  
  downloadFile: async (fileId) => {
    const response = await axios.get(`${API_URL}/files/${fileId}/download`);
    return response.data;
  },
  
  deleteFile: async (fileId) => {
    const response = await axios.delete(`${API_URL}/files/${fileId}`);
    return response.data;
  },
  
  previewFile: async (fileId) => {
    const response = await axios.get(`${API_URL}/files/${fileId}/preview`);
    return response.data;
  }
};

// Admin API
export const adminAPI = {
  getUsers: async () => {
    const response = await axios.get(`${API_URL}/admin/users`);
    return response.data;
  },
  
  getStats: async () => {
    const response = await axios.get(`${API_URL}/admin/stats`);
    return response.data;
  },
  
  updateUserStorage: async (userId, storageLimit) => {
    const response = await axios.patch(`${API_URL}/admin/users/${userId}/storage`, { storageLimit });
    return response.data;
  },
  
  deleteUser: async (userId) => {
    const response = await axios.delete(`${API_URL}/admin/users/${userId}`);
    return response.data;
  },
  
  getAllFiles: async () => {
    const response = await axios.get(`${API_URL}/admin/files`);
    return response.data;
  }
};

export default axios;
