// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Leads from './pages/Leads';
import LeadForm from './pages/LeadForm';
import { AuthContext } from './contexts/AuthContext';
import Navbar from './components/Navbar';

export default function App() {
  const { user } = React.useContext(AuthContext);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/leads" /> : <Navigate to="/login" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leads" element={user ? <Leads /> : <Navigate to="/login" />} />
        <Route path="/leads/new" element={user ? <LeadForm /> : <Navigate to="/login" />} />
        <Route path="/leads/:id/edit" element={user ? <LeadForm /> : <Navigate to="/login" />} />
      </Routes>
    </>
  );
}
