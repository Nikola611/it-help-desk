import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';
import BackButton from './BackButton';

let socket;

const TicketDetail = () => {
  const { ticketId } = useParams();
  const [ticket, setTicket] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });

    socket.on('connect', () => {
      console.log('Connected to server');
      socket.emit('join_room', { ticket_id: ticketId });
    });

    socket.on('receive_message', (message) => {
      setChatMessages((prev) => [...prev, message]);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return () => {
      socket.disconnect();
    };
  }, [ticketId]);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await fetch(`http://localhost:5000/auth/tickets/${ticketId}/messages`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        });
        if (!response.ok) {
          throw new Error('Failed to fetch messages');
        }
        const data = await response.json();
        setChatMessages(data);
      } catch (error) {
        console.error('Failed to fetch messages:', error);
      }
    };

    fetchMessages();
  }, [ticketId]);

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/auth/tickets/${ticketId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setTicket(data.ticket);
          setChatMessages(data.messages);
          setRole(data.role);
        } else {
          console.error('Error fetching ticket details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching ticket details:', error);
      }
    };

    fetchTicketDetails();
  }, [ticketId]);

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    try {
      const messageData = {
        message: newMessage,
        ticket_id: ticketId,
        sender: role,
        text: newMessage,
      };
      socket.emit('send_message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="ticket-detail">
      {ticket && (
        <>
          <BackButton />
          <h1>Ticket: {ticket.title}</h1>
          <p>Description: {ticket.description}</p>
          <p>Estimated Duration: {ticket.duration} minutes</p>
          <div className="chat-section">
            <h2>Chat</h2>
            <div className="chat-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`chat-message ${msg.sender === role ? 'sent' : 'received'}`}>
                  <strong>{msg.sender}:</strong> {msg.text}
                </div>
              ))}
            </div>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message here..."
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
        </>
      )}
    </div>
  );
};

export default TicketDetail;
