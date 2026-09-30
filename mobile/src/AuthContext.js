import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import api, { setToken } from './api';

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On app start: restore saved token and verify it with the server
  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync('token');
        if (saved) {
          setToken(saved);
          const { data } = await api.get('/auth/me');
          setUser(data.user);
        }
      } catch {
        setToken(null);
        await SecureStore.deleteItemAsync('token');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const authenticate = async (path, body) => {
    const { data } = await api.post(path, body);
    setToken(data.token);
    await SecureStore.setItemAsync('token', data.token);
    setUser(data.user);
  };

  const login = (email, password) => authenticate('/auth/login', { email, password });
  const register = (name, email, password) => authenticate('/auth/register', { name, email, password });
  const logout = async () => {
    setToken(null);
    await SecureStore.deleteItemAsync('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
