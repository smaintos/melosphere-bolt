// context/AuthContext.tsx

'use client';

import React, { createContext, useState, useEffect, ReactNode } from 'react';
import {jwtDecode} from 'jwt-decode';
import { useRouter } from 'next/navigation';

interface User {
  id: number;
  email: string;
}

interface AuthContextType {
  user: User | null;
  login: (token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  login: () => {},
  logout: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded: User = jwtDecode(token);
        setUser(decoded);
        console.log('Utilisateur authentifié:', decoded);
      } catch (error) {
        console.error('Token invalide', error);
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string) => {
    console.log('Connexion en cours...');
    localStorage.setItem('token', token);
    const decoded: User = jwtDecode(token);
    setUser(decoded);
  };

  const logout = () => {
    console.log('Déconnexion en cours...');
    localStorage.removeItem('token');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};
