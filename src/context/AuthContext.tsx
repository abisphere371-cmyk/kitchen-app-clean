import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as dataClient from '../lib/dataClient';

interface AuthContextType {
  user: any;
  loginWithUsername: (username: string, password: string, role: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  addUser: (userData: any) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // With cookie-based auth, we rely on the server to validate the session
  // The user will be fetched from the server on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const userDetails = await dataClient.getMe();
        if (userDetails) {
          setUser({
            id: userDetails.id,
            name: userDetails.name,
            email: userDetails.email,
            role: userDetails.role,
            phone: userDetails.phone || '',
            username: userDetails.username || userDetails.email
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // User is not authenticated, which is fine
        setUser(null);
      }
    };

    fetchUser();
  }, []);

  const addUser = async (userData: any): Promise<boolean> => {
    try {
      console.log('Adding user to auth system:', userData);
      return true;
    } catch (error) {
      console.error('Error adding user to auth system:', error);
      return false;
    }
  };

  const loginWithUsername = async (username: string, password: string, role: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log('🔍 Starting login process...');
      console.log('Username:', username);
      console.log('Role:', role);
      console.log('Password length:', password.length);

      // Try to login using the dataClient
      const result = await dataClient.loginWithUsername(username, password);
      
      if (result.success) {
        // Get user details
        const userDetails = await dataClient.getMe();
        if (userDetails) {
          const authenticatedUser = {
            id: userDetails.id,
            name: userDetails.name,
            email: userDetails.email,
            role: userDetails.role,
            phone: userDetails.phone || '',
            username: userDetails.username || userDetails.email
          };

          console.log('✅ Authentication successful! Setting user:', authenticatedUser);
          setUser(authenticatedUser);
          return true;
        }
      }

      console.log('❌ Authentication failed');
      return false;
    } catch (error) {
      console.error('❌ Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Make a request to the server to clear the cookie
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error logging out:', error);
    }
    setUser(null);
    console.log('👋 User logged out');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loginWithUsername,
      logout,
      isAuthenticated: !!user,
      loading,
      addUser
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}