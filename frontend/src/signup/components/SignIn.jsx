import React, { useState } from 'react';
import { signIn } from '../../admin/services/api'; // Adjust path as needed
import '../styles/SignIn.css';

export default function SignIn({ setActiveComponent, onVisibilityChange, isVisible, onLogin }) {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await signIn(credentials);
    
    if (result.success) {
      // Store token and user data
      localStorage.setItem('authToken', result.data.token);
      localStorage.setItem('userData', JSON.stringify(result.data.user));
      
      // Only call onLogin if it's provided
      if (onLogin) {
        onLogin(result.data.token, result.data.user);
      }
      
      // If no onLogin provided, you might want to redirect here
      if (!onLogin) {
        window.location.href = '/admin'; // Or your admin dashboard route
      }
    } else {
      setError(result.message);
    }
    
    setLoading(false);
  };

  const handleSignUp = () => {
    if (setActiveComponent) {
      setActiveComponent("signup");   
    }
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  const handleForgetPassword = () => {
    if (setActiveComponent) {
      setActiveComponent("forgetPassword");
    }
    if (onVisibilityChange) {
      onVisibilityChange(false);
    }
  };

  return (
    <div className="sign-in">
      <div className='sign-in-wrap'>
        <h1>Sign In</h1>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <input 
            type="text" 
            name="username" 
            placeholder="Username"
            value={credentials.username}
            onChange={handleInputChange}
            required
          /> 
          <br />
          <input 
            type="password" 
            name="password" 
            placeholder="Password" 
            value={credentials.password}
            onChange={handleInputChange}
            required
          />
          <br />
          <button 
            type="submit" 
            className='submit-btn'
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Submit'}
          </button>
        </form>

        <div className='sign-in-actions'>
          <p>
            Don't you have account?{' '}
            <span className="sign-up-link" onClick={handleSignUp}>Sign Up</span>
          </p>
          
          <p onClick={handleForgetPassword} className='forget-password-link'>Forget Password</p>
        </div>
      </div>
    </div>
  );
}