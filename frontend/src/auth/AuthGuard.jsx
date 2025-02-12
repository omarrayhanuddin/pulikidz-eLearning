import React from 'react';
import { Navigate } from 'react-router';
import { useAuth } from './AuthContext';

const AuthGuard = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return children;
};

export default AuthGuard;