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

  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('currentUser');
      }
    }
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
          localStorage.setItem('currentUser', JSON.stringify(authenticatedUser));
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

  const logout = () => {
    setUser(null);
    localStorage.removeItem('currentUser');
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