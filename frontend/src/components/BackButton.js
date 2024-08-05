// src/components/BackButton.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css'; // Create a CSS file for styling

const BackButton = () => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    navigate(-1); // Navigate to the previous page
  };

  return (
    <button className="back-button" onClick={handleBackClick}>
      ← Back
    </button>
  );
};

export default BackButton;
