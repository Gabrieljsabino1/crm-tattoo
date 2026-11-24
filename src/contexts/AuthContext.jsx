"use client";

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Cookies from 'js-cookie';
import axios from 'axios';
import { API_URL } from '../services/api';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const token = Cookies.get('token');
    const savedUser = Cookies.get('user');

    if (token && savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        Cookies.remove('token');
        Cookies.remove('user');
        if (pathname !== '/login') router.push('/login');
      }
    } else if (pathname !== '/login') {
      router.push('/login');
    }
    setLoading(false);
  }, [pathname, router]);

  const login = async (email, senha) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, senha });
      const { token, user: userData } = response.data;

      Cookies.set('token', token, { expires: 7 });
      Cookies.set('user', JSON.stringify(userData), { expires: 7 });

      setUser(userData);
      router.push('/dashboard');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Falha no login. Verifique suas credenciais.',
      };
    }
  };

  const logout = () => {
    Cookies.remove('token');
    Cookies.remove('user');
    setUser(null);
    router.push('/login');
  };

  const isAdmin = user?.role === 'ADMIN';
  const isTatuador = user?.role === 'TATUADOR' || user?.role === 'ADMIN';

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isTatuador }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
