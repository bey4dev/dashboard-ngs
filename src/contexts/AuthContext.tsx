import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import GoogleAuthService from '../services/googleAuth';
import type { GoogleUser } from '../services/googleAuth';

interface AuthContextType {
  user: GoogleUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  handleAuthCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<GoogleUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authService] = useState(() => GoogleAuthService.getInstance());

  useEffect(() => {
    // Check if user is already authenticated on app load
    const checkAuthStatus = async () => {
      try {
        setIsLoading(true);
        
        if (authService.isAuthenticated()) {
          const currentUser = authService.getCurrentUser();
          setUser(currentUser);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('❌ Error checking auth status:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  const login = () => {
    authService.initiateLogin();
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const handleAuthCallback = async (code: string): Promise<void> => {
    // If user is already authenticated, don't process callback again
    if (user) {
      return;
    }

    try {
      setIsLoading(true);
      const userInfo = await authService.handleCallback(code);
      setUser(userInfo);
    } catch (error) {
      console.error('❌ Authentication callback error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    handleAuthCallback,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
