// src/components/Navbar.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <Link to="/home" className="nav-link">Home</Link>
      <Link to="/signup" className="nav-link">Sign Up</Link>
      <Link to="/login" className="nav-link">Login</Link>
    </nav>
  );
};

export default Navbar;
