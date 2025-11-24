import { createContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../src/lib/api';
import { apiClient } from '../src/lib/api/client';

interface User {
  id: string;
  name: string;
  email: string;
  targetTrack: string;
  experienceLevel: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  targetTrack: string;
  experienceLevel: string;
  learningPreference: {
    dailyMinutes: number;
    preferKorean: boolean;
    learningStyle: string;
    weekendBoost: boolean;
  };
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored auth token and restore session
    const token = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      apiClient.setAccessToken(token);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
      
      // Validate token by fetching current user
      authApi.getCurrentUser()
        .then((response) => {
          if (response.success) {
            const userData = {
              id: String(response.data.memberId),
              name: response.data.name,
              email: response.data.email,
              targetTrack: response.data.targetTrack,
              experienceLevel: response.data.experienceLevel,
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
          }
        })
        .catch(() => {
          // Token invalid, clear session
          localStorage.removeItem('accessToken');
          localStorage.removeItem('user');
          apiClient.setAccessToken(null);
          setUser(null);
          setIsAuthenticated(false);
        });
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await authApi.login({ email, password });
      
      if (response.success) {
        const { accessToken, memberId, name, email: userEmail } = response.data;
        
        // Store token
        localStorage.setItem('accessToken', accessToken);
        apiClient.setAccessToken(accessToken);
        
        // Fetch full user profile
        const userResponse = await authApi.getCurrentUser();
        if (userResponse.success) {
          const userData = {
            id: String(userResponse.data.memberId),
            name: userResponse.data.name,
            email: userResponse.data.email,
            targetTrack: userResponse.data.targetTrack,
            experienceLevel: userResponse.data.experienceLevel,
          };
          
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
          setIsAuthenticated(true);
        }
      }
    } catch (error: any) {
      // Clear any partial state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      apiClient.setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      const response = await authApi.signup({
        name: data.name,
        email: data.email,
        password: data.password,
        targetTrack: data.targetTrack as any,
        experienceLevel: data.experienceLevel as any,
        learningPreference: data.learningPreference as any,
      });
      
      if (response.success) {
        // After signup, automatically login
        await login(data.email, data.password);
      }
    } catch (error: any) {
      // Clear any partial state
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      apiClient.setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors, clear local state anyway
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('user');
      apiClient.setAccessToken(null);
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, signup, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
