import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMe()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password, rememberMe) => {
    const { token, user } = await api.login(email, password, rememberMe);
    if (rememberMe) {
      localStorage.setItem('nb_token', token);
    } else {
      sessionStorage.setItem('nb_token', token);
    }
    setUser(user);
    return user;
  };

  const logout = () => {
    localStorage.removeItem('nb_token');
    sessionStorage.removeItem('nb_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
