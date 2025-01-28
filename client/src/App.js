import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { UserContextProvider } from './UserContext';
import IndexPage from './Pages/IndexPage';
import RegistrationPage from './Pages/RegistrationPage';
import './App.css'; 
import LoginPage from './Pages/LoginPage';
const App = () => {
  return (
    <Router>
      <UserContextProvider>
        <div className="app-container">
          <header className="header">
            <h1 className="app-title">Block APP</h1>
            <nav className="nav-bar">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/about" className="nav-link">About</Link>
            <Link to="/contact" className="nav-link">Contact</Link>
            <Link to="/blogs" className="nav-link">Blogs</Link>
            <Link to="/register" className="nav-link">Register</Link>
            <Link to="/login" className="login-Link">Login</Link>
          </nav>

          </header>
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </UserContextProvider>
    </Router>
  );
};

export default App;
