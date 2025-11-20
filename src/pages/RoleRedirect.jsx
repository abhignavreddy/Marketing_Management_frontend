import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const RoleRedirect = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Redirect to first menu item based on role
  const redirectMap = {
    Manager: '/manager-board',
    HR: '/employee-directory',
    CEO: '/dashboard',
    Employee: '/employee-board'
  };

  return <Navigate to={redirectMap[user.role] || '/login'} replace />;
};

export default RoleRedirect;
