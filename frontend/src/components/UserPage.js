// src/components/UserPage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './UserPage.css';
import UserDashboard from './UserDashboard';

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [role, setRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserRole(token);
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const fetchUserRole = async (token) => {
    try {
      const response = await fetch('http://localhost:5000/auth/userinfo', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setRole(data.role);
      } else {
        console.error(data.error);
      }
    } catch (error) {
      console.error('An error occurred. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const goToAdminDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="user-page-container">
      <div className="header">
        <div>
          <h1>{username}</h1>
          <p className="user-role">
            {role === 'it_helper' ? 'IT Helper' : role === 'admin' ? 'Admin' : 'Ticket User'}
          </p>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
      {role === 'ticket_user' && (
        <UserDashboard />
      )}
      {role === 'it_helper' && (
        <div className="calendar-container">
          <Calendar />
        </div>
      )}
      {role === 'admin' && (
        <div className="admin-options">
          <button className="admin-dashboard-btn" onClick={goToAdminDashboard}>
            Go to Admin Dashboard
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPage;
