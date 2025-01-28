import React, { useState } from 'react';
import './RegistrationPage.css'; 
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const RegistrationPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault(); 

    try {
      const response = await fetch('http://localhost:4000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Registration Successful');
        alert('Registration successful!');
        navigate('/');
      } else {
        console.log('Registration Failed');
        alert(`Registration failed: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="registration-container">
      <form className="registration-form" onSubmit={register}>
        <h2>Registration Page</h2>
        <label>Username</label>
        <input
          type="text"
          placeholder="Enter your Name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <label>Password</label>
        <input
          type="password"
          placeholder="Enter your Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Register</button>
        <br />
        <p>Already you have an Account <Link to="/login" className="Login"  >login</Link></p>
      </form>
    </div>
  );
};

export default RegistrationPage;
