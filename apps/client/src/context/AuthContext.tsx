'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@/types';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  isLoading: boolean;
  mounted: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
    
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser && storedUser !== 'undefined') {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser && parsedUser._id && parsedUser.email) {
            setUser(parsedUser);
          } else {
            localStorage.removeItem('user');
          }
        } catch (e) {
          console.error('Error parsing stored user:', e);
          localStorage.removeItem('user');
        }
      }
    } catch (e) {
      console.error('Error accessing storage:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (userData: User, token: string) => {
    try {
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Set the token in an HTTP-only cookie using the API
      await fetch('/api/auth/set-cookie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      // Use Next.js router for client-side navigation
      router.push('/dashboard');
    } catch (e) {
      console.error('Error storing auth data:', e);
      // Still redirect even if cookie setting fails
      router.push('/dashboard');
    }
  };

  const logout = async () => {
    try {
      setUser(null);
      localStorage.removeItem('user');
      
      // Clear the cookie using the API
      await fetch('/api/auth/clear-cookie', {
        method: 'POST',
      });

      // Use Next.js router for client-side navigation
      router.push('/login');
    } catch (e) {
      console.error('Error during logout:', e);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, mounted }}>
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