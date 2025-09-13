import React, { useState, useContext } from 'react';
import API from '../api/api';
import { AuthContext } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Register(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setUser } = useContext(AuthContext);
  const nav = useNavigate();

  const submit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/register', { email, password, name: 'New User' });
      setUser(res.data);
      nav('/leads');
    } catch (err) {
      alert(err.response?.data?.message || 'Register failed');
    }
  };

  return (
    <div style={{ maxWidth:400, margin:'40px auto' }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <label>Email</label><input value={email} onChange={e=>setEmail(e.target.value)} required />
        <label>Password</label><input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
