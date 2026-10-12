import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import api from '../api';

const AuthContext = createContext(null);

function getFallbackName(email, username) {
  if (username && username.trim() && username.trim().toLowerCase() !== 'user') {
    return username.trim();
  }
  if (email) {
    const raw = email.split('@')[0];
    const words = raw.split(/[^a-zA-Z]+/).filter(Boolean);
    if (words.length > 0) {
      return words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
    }
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }
  return 'User';
}

function getGoogleAvatarUrl(email) {
  if (!email) return null;
  const clean = email.trim().toLowerCase();
  if (clean.endsWith('@gmail.com') || clean.includes('@googlemail.com')) {
    return `https://unavatar.io/google/${encodeURIComponent(clean)}`;
  }
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('rise_user');
      if (!stored) return null;
      const parsed = JSON.parse(stored);
      if (parsed) {
        if (!parsed.name || parsed.name.trim().toLowerCase() === 'user') {
          parsed.name = getFallbackName(parsed.email, parsed.username);
        }
        if (!parsed.avatar_url && !parsed.avatar && !parsed.avatarUrl) {
          const autoAvatar = getGoogleAvatarUrl(parsed.email);
          if (autoAvatar) {
            parsed.avatar_url = autoAvatar;
            parsed.avatar = autoAvatar;
          }
        }
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const login = useCallback((userData) => {
    setUser((prev) => {
      let nextData = userData;
      if (nextData && (!nextData.name || nextData.name.trim().toLowerCase() === 'user')) {
        nextData = {
          ...nextData,
          name: getFallbackName(nextData.email, nextData.username),
        };
      }
      if (nextData && !nextData.avatar_url && !nextData.avatar && !nextData.avatarUrl) {
        const autoAvatar = getGoogleAvatarUrl(nextData.email);
        if (autoAvatar) {
          nextData = {
            ...nextData,
            avatar_url: autoAvatar,
            avatar: autoAvatar,
          };
        }
      }
      if (
        prev &&
        nextData &&
        prev.id === nextData.id &&
        prev.email === nextData.email &&
        prev.name === nextData.name &&
        prev.avatar_url === nextData.avatar_url
      ) {
        return prev;
      }
      return nextData;
    });
    if (userData) {
      try {
        const avatarToSave =
          userData.avatar_url ||
          userData.avatar ||
          userData.avatarUrl ||
          getGoogleAvatarUrl(userData.email);
        const toSave = {
          ...userData,
          name: userData.name && userData.name.trim().toLowerCase() !== 'user'
            ? userData.name
            : getFallbackName(userData.email, userData.username),
          avatar_url: avatarToSave,
          avatar: avatarToSave,
        };
        localStorage.setItem('rise_user', JSON.stringify(toSave));
      } catch {}
    }
  }, []);

  // Sync latest user profile from server if token exists
  useEffect(() => {
    const token = localStorage.getItem('rise_token');
    if (!token) return;
    api.get('/auth/me')
      .then((res) => {
        if (res.data?.user) {
          const u = res.data.user;
          login({
            id: u.id,
            name: u.name,
            username: u.username,
            email: u.email,
            avatar_url: u.avatar_url || getGoogleAvatarUrl(u.email),
            avatar: u.avatar_url || getGoogleAvatarUrl(u.email),
          });
        }
      })
      .catch(() => {});
  }, [login]);

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


