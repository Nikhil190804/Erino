import React from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import API from '../api/api';

export default function Navbar() {
  const { user, setUser, logout } = React.useContext(AuthContext);

  const handleLogout = async () => {
    await API.post('/auth/logout');
    setUser(null);
  };

  return (
    <nav style={{ padding: 12, borderBottom:'1px solid #ddd', display:'flex', justifyContent:'space-between' }}>
      <div><Link to="/">Lead Manager</Link></div>
      <div>
        {user ? (
          <>
            <span style={{marginRight:12}}>Hi, {user.name || user.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{marginRight:8}}>Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
