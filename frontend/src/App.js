// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './components/Signup';
import Login from './components/Login';
import UserPage from './components/UserPage';
import UserDashboard from './components/UserDashboard';
import ITHelperDashboard from './components/ITHelperDashboard';
import Home from './components/Home';
import Navbar from './components/Navbar';
import AdminDashboard from './components/AdminDashboard';
import TicketDetail from './components/TicketDetails';
import ITHelpersPage from './components/ITHelpersPage';
import './App.css';

const App = () => {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/user/:username" element={<UserPage />} />
          <Route path="/user/:username/dashboard" element={<UserDashboard />} />
          <Route path="/it-helper" element={<ITHelperDashboard />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/ticket/:ticketId" element={<TicketDetail />} />
          <Route path="/it-helpers" element={<ITHelpersPage />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
