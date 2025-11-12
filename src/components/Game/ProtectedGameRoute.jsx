// ProtectedGameRoute.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ProtectedGameRoute = ({ children }) => {
  const navigate = useNavigate();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    try {
      // Check for user data in localStorage
      const userData = localStorage.getItem('user_data');
      const token = localStorage.getItem('auth_token');

      if (!userData || !token) {
        // No user data or token found, redirect to login
        navigate('/login', { 
          state: { 
            from: window.location.pathname,
            message: 'Please log in to play the game'
          }
        });
        return;
      }

      // Verify token hasn't expired
      try {
        const user = JSON.parse(userData);
        if (!user || !(user.id || user._id)) {
          throw new Error('Invalid user data');
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        // Clear invalid data (use consistent keys)
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
        navigate('/login', { 
          state: { 
            from: window.location.pathname,
            message: 'Your session has expired. Please log in again.'
          }
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-yellow-400 text-xl">Loading...</div>
      </div>
    );
  }

  return isAuthorized ? children : null;
};

export default ProtectedGameRoute;