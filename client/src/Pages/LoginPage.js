import React, { useState, useContext } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { UserContext } from '../UserContext';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const {setUserInfo} = useContext(UserContext);
    const navigate = useNavigate();
    const [isSubmitting, setIsSubmitting]=useState(false);

    const login = async (e) => {
      e.preventDefault(); // Prevent the form from refreshing the page
      setIsSubmitting(true);
    
      try {
        const response = await fetch('http://localhost:4000/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ username, password }),
        });
    
        if (response.ok) {
          const userInfo = await response.json();
          console.log(userInfo);
          setUserInfo(userInfo);
          alert("Login Successful");
          navigate('/homepage');
        } else {+
          
          // Extract error message from response
          const errorResponse = await response.json();
          alert(errorResponse.message || 'Invalid username or password');
        }
      } catch (err) {
        console.error("Login not successful", err);
        alert('Login Failed: Please check your network or server.');
      } finally {
        setIsSubmitting(false);
      }
    };
    
  return (
    <div>
        <div className="registration-container">
      <form className="registration-form" onSubmit={login}>
        <h2>Login Page</h2>
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
        <button type="submit">Login</button>

        </form>
        </div>
    </div>
  )
}

export default LoginPage
