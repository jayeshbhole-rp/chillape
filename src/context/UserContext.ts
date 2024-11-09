import React, { createContext, useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { initTelegramAuth, getUserData } from '../services/telegramAuth';

const UserContext = createContext({
  id: null,
  first_name: '',
  last_name: '',
  username: '',
  photo_url: '',
  isLoading: true,
  isAuthenticated: false,
  refetchUserData: () => {},
  initializeAuth: () => {},
  language: 'en',
  setLanguage: () => {},
});

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: null,
    first_name: '',
    last_name: '',
    username: '',
    photo_url: '',
    language: 'en', // Initialize with user's preferred language
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const initRef = useRef(false);

  // Add this useEffect to log user state changes
  useEffect(() => {
    console.log('User state updated:', user);
  }, [user]);

  useEffect(() => {
    async function initAuth() {
      if (initRef.current) return;
      initRef.current = true;
      
      try {
        setIsLoading(true);
        await initTelegramAuth();
        const userData = getUserData();
        console.log('Telegram auth data:', userData);
        
        if (userData && userData.id) {
          setUser(prevUser => ({
            ...prevUser,
            ...userData,
            id: userData.id,
          }));
        } else {
          console.warn('No valid user data received from Telegram auth');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    }
    initAuth();
  }, []);

  const initializeAuth = useCallback(async () => {
    if (initRef.current) return;
    initRef.current = true;
    
    try {
      log('Initializing auth', {});
      setIsLoading(true);
      await initTelegramAuth();
      const userData = getUserData();
      log('Telegram auth data received', { userData });
      
      if (userData && userData.id) {
        setUser(prevUser => ({
          ...prevUser,
          ...userData,
          id: userData.id,
        }));
        setIsAuthenticated(true);
      } else {
        log('No valid user data received from Telegram auth', {});
        setIsAuthenticated(false);
      }
    } catch (error) {
      log('Error initializing auth', { error: error.message });
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = useCallback((newLanguage) => {
    setUser(prevUser => ({
      ...prevUser,
      language: newLanguage
    }));
  }, []);

  const contextValue = useMemo(() => ({
    ...user,
    isLoading,
    isAuthenticated,
    initializeAuth,
    setLanguage
  }), [user, isLoading, isAuthenticated, initializeAuth, setLanguage]);

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};

export default UserContext;
