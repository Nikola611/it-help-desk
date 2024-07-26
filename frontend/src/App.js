// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import UserPage from './components/UserPage';
import Home from './components/Home';
import Navbar from './components/Navbar'; // Import Navbar
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar /> {/* Include Navbar */}
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/:username" element={<UserPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
