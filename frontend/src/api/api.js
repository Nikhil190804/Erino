import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000/api',
  withCredentials: true
});


API.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    if (status === 403) {
      alert(err.response?.data?.message || 'You do not have permission to perform this action.');
    }
    return Promise.reject(err);
  }
);

export default API;
