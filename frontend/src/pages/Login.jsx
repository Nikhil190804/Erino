import React, { useState, useContext } from 'react';
import API from '../api/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password });
      setUser(res.data);
      nav('/leads');
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth:400, margin:'40px auto' }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
