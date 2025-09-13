// src/api/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || 'http://localhost:4000/api',
  withCredentials: true
});

// Do NOT do automatic window.location on 401 — that causes loops.
// Instead: surface 401 to caller (components/AuthProvider) to decide.
API.interceptors.response.use(
  res => res,
  err => {
    const status = err.response?.status;
    if (status === 403) {
      // friendly message for forbidden actions
      alert(err.response?.data?.message || 'You do not have permission to perform this action.');
    }
    // Do not auto-redirect on 401 here.
    return Promise.reject(err);
  }
);

export default API;
