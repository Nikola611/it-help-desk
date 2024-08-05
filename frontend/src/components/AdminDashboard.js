import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [pendingTickets, setPendingTickets] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchPendingAccounts();
    fetchPendingTickets();
  }, []);

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

  const fetchPendingTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/admin/tickets', {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPendingTickets(data);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to fetch pending tickets.');
      }
    } catch (error) {
      setMessage('Failed to fetch pending tickets. Please try again later.');
    }
  };

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
        setPendingAccounts(pendingAccounts.filter(account => account.id !== userId));
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
        setPendingAccounts(pendingAccounts.filter(account => account.id !== userId));
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to deny account.');
      }
    } catch (error) {
      setMessage('An error occurred while denying. Please try again.');
    }
  };

  const handleApproveTicket = async (ticketId, timeEstimate) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/admin/tickets/approve/${ticketId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ time_estimate: timeEstimate }),
      });
      if (response.ok) {
        setPendingTickets(pendingTickets.filter(t => t.id !== ticketId));
        setMessage('Ticket approved successfully.');
      }
    } catch (error) {
      setMessage('An error occurred while approving the ticket.');
    }
  };

  const navigateToItHelpers = () => {
    navigate('/it-helpers');
  };

  return (
    <div className="admin-dashboard">
      <h1 className="dashboard-title">Admin Dashboard</h1>
      <button onClick={navigateToItHelpers} className="view-it-helpers-btn">View IT Helpers</button>
      {message && <p className="error-message">{message}</p>}
      <h2 className="section-title">Pending Accounts</h2>
      <ul className="pending-accounts-list">
        {pendingAccounts.map(account => (
          <li key={account.id} className="pending-account-item">
            <span className="account-info">{account.username} - {account.email} - {account.role}</span>
            <div className="action-buttons">
              <button className="approve-btn" onClick={() => approveAccount(account.id)}>Approve</button>
              <button className="deny-btn" onClick={() => denyAccount(account.id)}>Deny</button>
            </div>
          </li>
        ))}
      </ul>
      <h2 className="section-title">Pending Tickets</h2>
      <ul className="pending-tickets-list">
        {pendingTickets.map(ticket => (
          <li key={ticket.id} className="pending-ticket-item">
            <h3>{ticket.title}</h3>
            <p>{ticket.description}</p>
            <div>
              <input type="number" min="1" placeholder="Set Time Estimate" onChange={(e) => ticket.timeEstimate = parseInt(e.target.value)}/>
              <button onClick={() => handleApproveTicket(ticket.id, ticket.timeEstimate)}>Approve</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminDashboard;
