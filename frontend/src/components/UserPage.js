// src/components/UserPage.js
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './UserPage.css';

const UserPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="user-page-container">
      <h1>Welcome, {username}!</h1>
      <div className="profile-info">
        <p>Username: {username}</p>
        {/* Add more user-specific information here if needed */}
      </div>
      <button className="logout-btn" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
};

export default UserPage;
