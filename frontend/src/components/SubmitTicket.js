// src/components/SubmitTicket.js
import React, { useState } from 'react';
import './SubmitTicket.css';

const SubmitTicket = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
  });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('http://localhost:5000/auth/tickets', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify(formData),
    });

    const data = await response.json();
    if (response.ok) {
      setMessage('Ticket created successfully!');
      setFormData({ title: '', description: '', duration: '' }); // Reset form
    } else {
      setMessage(data.error);
    }
  };

  return (
    <div className="submit-ticket-container">
      <h2>Submit a Ticket</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Estimated Duration (minutes)</label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit" className="submit-ticket-btn">Submit Ticket</button>
      </form>
      {message && <p>{message}</p>}
    </div>
  );
};

export default SubmitTicket;
