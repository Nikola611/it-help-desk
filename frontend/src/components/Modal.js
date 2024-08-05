// src/components/Modal.js
import React from 'react';
import './Modal.css'; // Make sure to style your modal

const Modal = ({ children, onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        {children}
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default Modal;
