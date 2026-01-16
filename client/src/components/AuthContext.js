import React, { createContext, useState, useContext } from 'react';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const token = localStorage.getItem("token");
  const userInfo = localStorage.getItem("userInfo");

  let decoded = {};
  if (token) {
    try {
      decoded = JSON.parse(atob(token.split(".")[1]));
    } catch (error) {
      // console.error("Token decode error:", error);
    }
  }

  const [auth, setAuth] = useState({
    token: token || '',
    role: decoded.role || '',
    userId: decoded.userId || '',
  });

  const [user, setUser] = useState(userInfo ? JSON.parse(userInfo) : null);

  const updateAuth = (data) => {
    setAuth(data);
    if (data.token) {
      localStorage.setItem('token', data.token);
    } else {
      localStorage.removeItem('token');
    }
    if (data.user) {
      setUser(data.user);
      localStorage.setItem('userInfo', JSON.stringify(data.user));
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    setAuth({ token: '', role: '', userId: '' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ auth, user,setUser, updateAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
