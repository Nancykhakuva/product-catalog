import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <header className="header">
      <h1>Product Catalog</h1>
      <button className="btn" onClick={handleLogout} data-testid="logout-btn">
        Logout
      </button>
    </header>
  );
}

