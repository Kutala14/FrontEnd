import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { authClient } from '../lib/auth-client';
import { UserRole, UserSession } from '../types/session';

const ACCESS_TOKEN_STORAGE_KEY = 'kutala_access_token';
const API_KEY = (import.meta.env.VITE_API_KEY || '').trim();
const API_KEY_HEADER = (import.meta.env.VITE_API_KEY_HEADER || 'x-api-key').trim();

interface SessionContextValue {
  status: 'loading' | 'guest' | 'authenticated';
  user: UserSession | null;
  accessToken: string | null;
  login: (payload: { email: string; password: string; type: UserRole }) => Promise<void>;
  loginWithGoogle: (payload: {
    credential: string;
    type: UserRole;
    name?: string;
    phone?: string;
    location?: string;
    cuisine_id?: number;
    cuisine?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<string | null>;
  fetchWithAuth: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

function useSessionContextValue(): SessionContextValue {
  const [status, setStatus] = useState<'loading' | 'guest' | 'authenticated'>('loading');
  const [user, setUser] = useState<UserSession | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const clearSession = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setStatus('guest');
    localStorage.removeItem(ACCESS_TOKEN_STORAGE_KEY);
  }, []);

  const applySession = useCallback((payload: { user: UserSession; accessToken: string; expiresIn: number }) => {
    setUser(payload.user);
    setAccessToken(payload.accessToken);
    setStatus('authenticated');
    if (payload.accessToken) {
      localStorage.setItem(ACCESS_TOKEN_STORAGE_KEY, payload.accessToken);
    }
  }, []);

  const refreshAccessToken = useCallback(async () => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    refreshPromiseRef.current = (async () => {
      try {
        const storedToken = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY);
        if (!storedToken) {
          clearSession();
          return null;
        }
        setAccessToken(storedToken);
        setStatus('authenticated');
        return storedToken;
      } catch {
        clearSession();
        return null;
      } finally {
        refreshPromiseRef.current = null;
      }
    })();

    return refreshPromiseRef.current;
  }, [clearSession]);

  const fetchWithAuth = useCallback(async (input: RequestInfo | URL, init: RequestInit = {}) => {
    if (!API_KEY) {
      throw new Error('API key nao configurada. Defina VITE_API_KEY no ficheiro .env.');
    }

    const send = (token: string | null) => {
      const headers = new Headers(init.headers || {});
      headers.set(API_KEY_HEADER, API_KEY);

      if (!token) return fetch(input, { ...init, headers });

      headers.set('Authorization', `Bearer ${token}`);
      return fetch(input, { ...init, headers });
    };

    let tokenToUse = accessToken;
    if (!tokenToUse && status === 'authenticated') {
      tokenToUse = await refreshAccessToken();
    }

    let response = await send(tokenToUse);
    if (response.status !== 401) {
      return response;
    }

    const refreshedToken = await refreshAccessToken();
    if (!refreshedToken) {
      return response;
    }

    return send(refreshedToken);
  }, [accessToken, refreshAccessToken, status]);

  const login = useCallback(async (payload: { email: string; password: string; type: UserRole }) => {
    const result = await authClient.login(payload);
    applySession({ user: result.user, accessToken: result.accessToken, expiresIn: result.expiresIn });
  }, [applySession]);

  const loginWithGoogle = useCallback(async (payload: {
    credential: string;
    type: UserRole;
    name?: string;
    phone?: string;
    location?: string;
    cuisine_id?: number;
    cuisine?: string;
  }) => {
    const result = await authClient.googleAuth(payload);
    applySession({ user: result.user, accessToken: result.accessToken, expiresIn: result.expiresIn });
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } finally {
      clearSession();
    }
  }, [clearSession]);

  useEffect(() => {
    let isMounted = true;
    const token = localStorage.getItem(ACCESS_TOKEN_STORAGE_KEY) || null;

    if (!token) {
      clearSession();
      return () => {
        isMounted = false;
      };
    }

    authClient
      .session(token)
      .then((result) => {
        if (!isMounted) return;
        applySession(result);
      })
      .catch(() => {
        if (!isMounted) return;
        clearSession();
      });

    return () => {
      isMounted = false;
    };
  }, [applySession, clearSession]);

  return { status, user, accessToken, login, loginWithGoogle, logout, refreshAccessToken, fetchWithAuth };
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const value = useSessionContextValue();
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return context;
}
