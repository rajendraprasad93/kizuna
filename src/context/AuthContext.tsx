import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import type { Profile, UserRole } from '@/types';

interface AuthContextValue {
  session: { user: Profile } | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const session = profile ? { user: profile } : null;

  const loadProfile = async () => {
    try {
      const user = await api.auth.me();
      setProfile(user);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const signUp = async (email: string, password: string, fullName: string, role: UserRole) => {
    try {
      const { user } = await api.auth.register(email, password, fullName, role);
      setProfile(user);
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Registration failed';
      return { error: message };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { user } = await api.auth.login(email, password);
      setProfile(user);
      return { error: null };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Invalid credentials or server error';
      return { error: message };
    }
  };

  const signOut = async () => {
    api.auth.logout();
    setProfile(null);
  };

  const refreshProfile = async () => {
    await loadProfile();
  };

  return (
    <AuthContext.Provider value={{ session, profile, loading, signUp, signIn, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
