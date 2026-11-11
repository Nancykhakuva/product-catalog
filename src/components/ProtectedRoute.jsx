import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import Header from './Header';

export default function ProtectedRoute() {
  const token = localStorage.getItem('token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}
