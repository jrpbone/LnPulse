import React, { createContext, useState, useContext, useEffect } from 'react';
import { getPrivilegesForRole } from '../config/privileges';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [privileges, setPrivileges] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    const storedPrivileges = localStorage.getItem('privileges');
    const isAuth = localStorage.getItem('authenticated') === 'true';

    if (isAuth && storedUser && storedPrivileges) {
      const parsedUser = JSON.parse(storedUser);
      const parsedPrivileges = JSON.parse(storedPrivileges);
      
      setUser(parsedUser);
      setPrivileges(parsedPrivileges);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = (userData) => {
    // Get privileges based on user role
    const userPrivileges = getPrivilegesForRole(userData.type);
    
    // Add any role-specific data
    if (userData.type === 'department_user') {
      userPrivileges.departmentId = userData.departmentUser?.department?.department_id;
    } else if (userData.type === 'section_user') {
      userPrivileges.sectionId = userData.sectionUser?.section?.section_id;
      userPrivileges.departmentId = userData.sectionUser?.department?.department_id;
    }

    setUser(userData);
    setPrivileges(userPrivileges);
    setIsAuthenticated(true);
    
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('privileges', JSON.stringify(userPrivileges));
    localStorage.setItem('authenticated', 'true');
  };

  const logout = () => {
    setUser(null);
    setPrivileges(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    localStorage.removeItem('privileges');
    localStorage.removeItem('authenticated');
  };

  const hasPrivilege = (privilege) => {
    if (!privileges) return false;
    return privileges[privilege] === true;
  };

  const hasAnyPrivilege = (requiredPrivileges) => {
    if (!privileges) return false;
    return requiredPrivileges.some(privilege => privileges[privilege] === true);
  };

  const hasAllPrivileges = (requiredPrivileges) => {
    if (!privileges) return false;
    return requiredPrivileges.every(privilege => privileges[privilege] === true);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user, privileges, isAuthenticated, login, logout, hasPrivilege, hasAnyPrivilege, hasAllPrivileges }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 