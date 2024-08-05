import React, { useState, useEffect } from 'react';
import './UserDashboard.css';
import { useNavigate } from 'react-router-dom';

const UserDashboard = () => {
  const [showSubmitForm, setShowSubmitForm] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submittedTickets, setSubmittedTickets] = useState([]);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchSubmittedTickets();
  }, [showSubmitForm]);

  const fetchSubmittedTickets = async () => {
    try {
      const response = await fetch('http://localhost:5000/auth/tickets/user-submitted', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await response.json();
      if (response.ok) {
        setSubmittedTickets(data.tickets || []); // Ensure tickets are always an array
      } else {
        setMessage(data.error || 'Failed to fetch submitted tickets.');
      }
    } catch (error) {
      setMessage('Failed to fetch submitted tickets. Please try again later.');
    }
  };

  const handleToggleView = () => {
    setShowSubmitForm(!showSubmitForm);
  };

  const openChat = (ticketId) => {
    navigate(`/ticket/${ticketId}`);
  };

  const approveAndDeleteTicket = async (ticketId) => {
    try {
      const response = await fetch(`http://localhost:5000/auth/tickets/approve-and-delete/${ticketId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setMessage('Ticket approved and deleted successfully');
        fetchSubmittedTickets(); // Refresh the list after deletion
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to delete ticket.');
      }
    } catch (error) {
      setMessage('Error deleting ticket. Please try again.');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const ticketData = { title, description };
    try {
      const response = await fetch('http://localhost:5000/auth/tickets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(ticketData),
      });

      const data = await response.json();
      if (response.ok) {
        setSubmittedTickets([...submittedTickets, { id: data.ticket.id, title }]);
        setTitle('');
        setDescription('');
        setMessage('Ticket submitted successfully!');
      } else {
        setMessage(data.error || 'An error occurred while submitting the ticket.');
      }
    } catch (error) {
      setMessage('An error occurred while submitting the ticket.');
    }
  };

  return (
    <div className="user-dashboard">
      <h1>User Dashboard</h1>
      <button onClick={handleToggleView} className="toggle-view-btn">
        {showSubmitForm ? 'View Submitted Tickets' : 'Submit Ticket'}
      </button>
      {showSubmitForm ? (
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="input-label">Title</label>
            <input
              type="text"
              className="input-text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="input-label">Description</label>
            <textarea
              className="textarea-text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="submit-button">Submit Ticket</button>
        </form>
      ) : (
        <ul className="ticket-list">
          {submittedTickets.length > 0 ? (
            submittedTickets.map((ticket) => (
              <div key={ticket.id} className="ticket-item">
                <h3>{ticket.title}</h3>
                <button onClick={() => openChat(ticket.id)}>Open Chat</button>
                <button onClick={() => approveAndDeleteTicket(ticket.id)} className="approve-delete-btn">
                  Approve & Delete
                </button>
              </div>
            ))
          ) : (
            <p>No tickets submitted yet.</p>
          )}
        </ul>
      )}
      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default UserDashboard;
