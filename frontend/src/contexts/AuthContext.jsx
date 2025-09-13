import React, { createContext, useState, useEffect, useRef } from 'react';
import API from '../api/api';
import { useNavigate } from 'react-router-dom';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);
  const controllerRef = useRef(null);
  const navigate = useNavigate?.(); 

  async function fetchMe() {
    if (controllerRef.current) {
      try { controllerRef.current.abort(); } catch (e) {}
    }
    const controller = new AbortController();
    controllerRef.current = controller;

    try {
      setLoading(true);
      const res = await API.get('/auth/me', { signal: controller.signal });
      setUser(res.data);
      setLoading(false);
      return res.data;
    } catch (err) {
      if (err.name === 'CanceledError' || err.name === 'AbortError') {
        return null;
      }
      setUser(null);
      setLoading(false);
      return null;
    } finally {
      controllerRef.current = null;
    }
  }

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    fetchMe();

    return () => {
      if (controllerRef.current) {
        try { controllerRef.current.abort(); } catch (e) {}
      }
    };
  }, []);

  const logout = async () => {
    try { await API.post('/auth/logout'); } catch (e) {}
    setUser(null);
    try { if (navigate) navigate('/login'); } catch (e) {}
  };

  return (
    <AuthContext.Provider value={{ user, setUser, fetchMe, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
