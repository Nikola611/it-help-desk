// src/components/AdminDashboard.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingAccounts = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/admin/pending-accounts', {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setPendingAccounts(data);
        } else {
          const errorData = await response.json();
          setMessage(errorData.error || 'An error occurred. Please try again.');
        }
      } catch (error) {
        setMessage('An error occurred. Please try again.');
      }
    };

    fetchPendingAccounts();
  }, []);

  const approveAccount = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/admin/approve/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setPendingAccounts(pendingAccounts.filter((account) => account.id !== userId));
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to approve account.');
      }
    } catch (error) {
      setMessage('An error occurred while approving. Please try again.');
    }
  };

  const denyAccount = async (userId) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/admin/deny/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.ok) {
        setPendingAccounts(pendingAccounts.filter((account) => account.id !== userId));
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to deny account.');
      }
    } catch (error) {
      setMessage('An error occurred while denying. Please try again.');
    }
  };

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      {message && <p className="error-message">{message}</p>}
      <h2 className="section-title">Pending Accounts</h2>
      <ul className="pending-accounts-list">
        {pendingAccounts.map((account) => (
          <li key={account.id} className="pending-account-item">
            <span className="account-info">
              {account.username} - {account.email} - {account.role}
            </span>
            <div className="action-buttons">
              <button className="approve-btn" onClick={() => approveAccount(account.id)}>
                Approve
              </button>
              <button className="deny-btn" onClick={() => denyAccount(account.id)}>
                Deny
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
