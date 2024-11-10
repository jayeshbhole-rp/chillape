import { getUserData, initTelegramAuth } from '@/lib/telegramAuth';
import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef,
  useMemo,
  ReactElement,
  useContext,
} from 'react';

interface UserContextType {
  id: string | null;
  first_name: string;
  last_name: string;
  username: string;
  photo_url: string;
  isLoading: boolean;
  isAuthenticated: boolean;
  refetchUserData: () => void;
  initializeAuth: () => void;
  language: 'en';
  setLanguage: (l: string) => void;
}

const UserContext = createContext<UserContextType>({
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

export const UserProvider = ({ children }: { children: ReactElement }) => {
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
          setUser((prevUser) => ({
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
      console.log('Initializing auth', {});
      setIsLoading(true);
      await initTelegramAuth();
      const userData = getUserData();
      console.log('Telegram auth data received', { userData });

      if (userData && userData.id) {
        setUser((prevUser) => ({
          ...prevUser,
          ...userData,
          id: userData.id,
        }));
        setIsAuthenticated(true);
      } else {
        console.log('No valid user data received from Telegram auth', {});
        setIsAuthenticated(false);
      }
    } catch (error: any) {
      console.log('Error initializing auth', { error: error.message });
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setLanguage = useCallback((newLanguage: string) => {
    setUser((prevUser) => ({
      ...prevUser,
      language: newLanguage,
    }));
  }, []);

  const contextValue = useMemo(
    () =>
      ({
        ...user,
        isLoading,
        isAuthenticated,
        initializeAuth,
        setLanguage,
        refetchUserData: () => {},
        first_name: user.first_name,
        id: user.id,
        language: user.language,
        last_name: user.last_name,
        photo_url: user.photo_url,
        username: user.username,
      }) as UserContextType,
    [user, isLoading, isAuthenticated, initializeAuth, setLanguage],
  );

  return <UserContext.Provider value={contextValue}>{children}</UserContext.Provider>;
};

export const useUserContext = () => useContext(UserContext);

export default UserContext;
