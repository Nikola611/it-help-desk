// src/components/Home.js
import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Welcome to the IT Help Desk</h1>
      <div className="home-links">
        <Link to="/signup">Sign Up</Link>
        <Link to="/login">Login</Link>
      </div>
    </div>
  );
};

export default Home;
