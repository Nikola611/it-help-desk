// src/components/TicketSubmissionForm.js
import React, { useState } from 'react';

const TicketSubmissionForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const ticketData = {
      title,
      description,
      duration: 10,
    };

    onSubmit(ticketData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </div>
      <button type="submit">Submit Ticket</button>
    </form>
  );
};

export default TicketSubmissionForm;
