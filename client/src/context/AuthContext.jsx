import { createContext, useContext, useState, useCallback, useMemo } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rise_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    setUser((prev) => {
      if (
        prev &&
        userData &&
        prev.id === userData.id &&
        prev.email === userData.email &&
        prev.name === userData.name &&
        prev.avatar_url === userData.avatar_url
      ) {
        return prev;
      }
      return userData;
    });
    if (userData) {
      try {
        localStorage.setItem('rise_user', JSON.stringify(userData));
      } catch {}
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      localStorage.removeItem('rise_user');
      localStorage.removeItem('rise_token');
    } catch {}
  }, []);

  const value = useMemo(() => ({ user, login, logout }), [user, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}


