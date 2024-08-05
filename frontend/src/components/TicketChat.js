import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import BackButton from './BackButton';

const socket = io('http://localhost:5000', { transports: ['websocket', 'polling'] });

const TicketChat = ({ ticketId, username }) => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    socket.emit('join_room', { ticket_id: ticketId });

    socket.on('receive_message', (data) => {
      setChatMessages((messages) => [...messages, data]);
    });

    return () => {
      socket.off('receive_message');
    };
  }, [ticketId]);

  const sendMessage = () => {
    if (message.trim()) {
      socket.emit('send_message', {
        message,
        ticket_id: ticketId,
        sender: username,
      });
      setMessage('');
    }
  };

  return (
    <div>
      <BackButton />
      <h3>Chat for Ticket #{ticketId}</h3>
      <div>
        {chatMessages.map((msg, index) => (
          <p key={index}>
            <strong>{msg.sender}:</strong> {msg.text}
          </p>
        ))}
      </div>
      <input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default TicketChat;
