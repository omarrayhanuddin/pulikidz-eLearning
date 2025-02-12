import axios from 'axios';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
axios.defaults.baseURL = baseUrl;

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = "/"
    }
    return Promise.reject(error);
  }
);

export default axios;