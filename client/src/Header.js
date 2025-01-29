import React from 'react'
import { Link } from 'react-router-dom';
import './Header.css'; 

const Header = () => {
  return (
    <div>
       <header className="header">
            <h1 className="app-title">Block APP</h1>
            <nav className="nav-bar">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
            <Link to="/connect" className="nav-link">Connect</Link>
            <Link to="/login" className="nav-link">Login</Link>
            </nav>
            </header>
            
    </div>
  )
}

export default Header
