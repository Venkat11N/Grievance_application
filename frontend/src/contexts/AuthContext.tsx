import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { pushService } from '../services/push';

interface User {
  role: 'seafarer' | 'official';
  token: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await SecureStore.getItemAsync('authToken');
    const role = await SecureStore.getItemAsync('userRole');
    
    if (token && role) {
      setUser({ token, role: role as 'seafarer' | 'official' });
      setIsAuthenticated(true);
      // Register push token when user is authenticated
      pushService.registerPushToken();
    }
  };

  const login = async (userData: User) => {
    await SecureStore.setItemAsync('authToken', userData.token);
    await SecureStore.setItemAsync('userRole', userData.role);
    setUser(userData);
    setIsAuthenticated(true);
    // Register push token on login
    pushService.registerPushToken();
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    await SecureStore.deleteItemAsync('userRole');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
