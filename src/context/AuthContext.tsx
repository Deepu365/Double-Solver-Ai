'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export interface UserProfile {
  id: string;
  email: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isConfigured: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string; success?: boolean }>;
  signOut: () => Promise<void>;
  signInDemo: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConfigured, setIsConfigured] = useState(false);
  const router = useRouter();

  const supabase = createClient();

  const checkUser = useCallback(async () => {
    setIsLoading(true);
    if (!supabase) {
      setIsConfigured(false);
      // Check localStorage for demo user session
      const stored = typeof window !== 'undefined' ? localStorage.getItem('doubtsolver_demo_user') : null;
      if (stored) {
        try {
          setUser(JSON.parse(stored));
        } catch {
          setUser(null);
        }
      } else {
        // Default guest/demo user for instant exploration
        const defaultUser: UserProfile = {
          id: 'demo-user',
          email: 'student@engineering.edu',
          isDemo: true,
        };
        setUser(defaultUser);
        if (typeof window !== 'undefined') {
          localStorage.setItem('doubtsolver_demo_user', JSON.stringify(defaultUser));
        }
      }
      setIsLoading(false);
      return;
    }

    setIsConfigured(true);
    try {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();

      if (authUser) {
        setUser({
          id: authUser.id,
          email: authUser.email || 'user@engineering.edu',
        });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    checkUser();

    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          setUser({
            id: session.user.id,
            email: session.user.email || 'user@engineering.edu',
          });
        } else {
          setUser(null);
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [checkUser, supabase]);

  const signIn = async (email: string, password: string): Promise<{ error?: string }> => {
    if (!supabase) {
      // Demo authentication
      const demoUser: UserProfile = {
        id: 'demo-user',
        email,
        isDemo: true,
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('doubtsolver_demo_user', JSON.stringify(demoUser));
      }
      router.push('/chat');
      return {};
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      router.push('/chat');
      return {};
    } catch {
      return { error: 'An unexpected authentication error occurred.' };
    }
  };

  const signUp = async (email: string, password: string): Promise<{ error?: string; success?: boolean }> => {
    if (!supabase) {
      const demoUser: UserProfile = {
        id: 'demo-user',
        email,
        isDemo: true,
      };
      setUser(demoUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('doubtsolver_demo_user', JSON.stringify(demoUser));
      }
      router.push('/chat');
      return { success: true };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      return { success: true };
    } catch {
      return { error: 'An unexpected signup error occurred.' };
    }
  };

  const signOut = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
    if (typeof window !== 'undefined') {
      localStorage.removeItem('doubtsolver_demo_user');
    }
    setUser(null);
    router.push('/login');
  };

  const signInDemo = async () => {
    const demoUser: UserProfile = {
      id: 'demo-user',
      email: 'student@engineering.edu',
      isDemo: true,
    };
    setUser(demoUser);
    if (typeof window !== 'undefined') {
      localStorage.setItem('doubtsolver_demo_user', JSON.stringify(demoUser));
    }
    router.push('/chat');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isConfigured,
        signIn,
        signUp,
        signOut,
        signInDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
