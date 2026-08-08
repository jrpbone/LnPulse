import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requiredPrivileges = [], 
  unauthorizedRoles = [] 
}) => {
  const { isAuthenticated, privileges, user } = useAuth();
  const location = useLocation();

  // Check if the user is authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check if the user's role is unauthorized
  if (unauthorizedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Check if the user has the required privileges
  const hasPrivileges = requiredPrivileges.every((privilege) => privileges?.[privilege]);
  if (!hasPrivileges) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;