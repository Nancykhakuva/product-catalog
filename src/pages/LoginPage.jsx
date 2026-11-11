import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // If already logged in, redirect to home
  useEffect(() => {
    if (localStorage.getItem('token')) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    // Auth requirement: On login, save a dummy token and navigate to /
    localStorage.setItem('token', 'dummy');
    navigate('/');
  };

  return (
    <div className="login-wrap">
      <form className="card form" onSubmit={handleSubmit} noValidate data-testid="login-form">
        <h2>Login</h2>
        <label>
          Username
          <input
            name="username"
            type="text"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value);
              if (error) setError('');
            }}
            data-testid="login-username"
          />
        </label>
        <label>
          Password
          <input
            name="password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (error) setError('');
            }}
            data-testid="login-password"
          />
        </label>
        {error && (
          <p className="error" data-testid="login-error">
            {error}
          </p>
        )}
        <button className="btn primary" type="submit" data-testid="login-submit">
          Log in
        </button>
        <p className="hint">Any username and password will do.</p>
      </form>
    </div>
  );
}
