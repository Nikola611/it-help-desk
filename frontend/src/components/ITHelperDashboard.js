import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './ITHelperDashboard.css';
import { useNavigate } from 'react-router-dom';

const localizer = momentLocalizer(moment);

const ITHelperDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [newDuration, setNewDuration] = useState('');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const response = await fetch('http://localhost:5000/auth/tickets/assigned', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        const data = await response.json();
        if (response.ok) {
          // Map tickets to calendar event format
          const events = data.map((ticket) => ({
            id: ticket.id,
            title: ticket.title,
            start: new Date(ticket.scheduled_time),
            end: new Date(new Date(ticket.scheduled_time).getTime() + ticket.duration * 60000),
          }));
          setTickets(events);
        } else {
          setMessage(data.error);
        }
      } catch (error) {
        setMessage('Failed to fetch tickets. Please try again later.');
      }
    };

    fetchTickets();
  }, []);

  const handleEventClick = (event) => {
    navigate(`/ticket/${event.id}`);
  };

  const handleUpdateDuration = async () => {
    if (!newDuration || isNaN(newDuration) || newDuration <= 0) {
      setMessage('Please enter a valid duration.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/auth/tickets/update-time/${selectedTicket.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ duration: newDuration }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('Ticket time updated successfully!');
        setSelectedTicket(null);
        setNewDuration('');
        // Refresh the tickets
        const updatedTickets = tickets.map((ticket) =>
          ticket.id === selectedTicket.id
            ? {
                ...ticket,
                duration: newDuration,
                end: new Date(new Date(ticket.start).getTime() + newDuration * 60000),
              }
            : ticket
        );
        setTickets(updatedTickets);
      } else {
        setMessage(data.error);
      }
    } catch (error) {
      setMessage('An error occurred while updating the ticket.');
    }
  };

  return (
    <div className="it-helper-dashboard">
      <h1>IT Helper Dashboard</h1>
      {message && <p className="status-message">{message}</p>}
      <Calendar
        localizer={localizer}
        events={tickets}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500 }}
        onSelectEvent={handleEventClick}
      />
      {selectedTicket && (
        <div className="ticket-details">
          <h2>Ticket Details</h2>
          <p>Title: {selectedTicket.title}</p>
          <p>Duration: {selectedTicket.duration} minutes</p>
          <input
            type="number"
            placeholder="Enter new duration"
            value={newDuration}
            onChange={(e) => setNewDuration(e.target.value)}
          />
          <button onClick={handleUpdateDuration}>Update Duration</button>
        </div>
      )}
    </div>
  );
};

export default ITHelperDashboard;
