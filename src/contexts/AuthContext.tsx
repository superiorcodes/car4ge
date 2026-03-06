import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      if (error) {
        console.warn('Profile fetch error:', error);
        return null;
      }
      return data;
    } catch (err) {
      console.warn('Profile fetch exception:', err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const handleAuthStateChange = async (newSession: Session | null) => {
      if (!isMounted || abortController.signal.aborted) return;

      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (newSession?.user) {
        try {
          const profileData = await fetchProfile(newSession.user.id);
          if (isMounted && !abortController.signal.aborted) {
            setProfile(profileData);
          }
        } catch (err) {
          console.warn('Profile fetch error:', err);
        }
      } else {
        if (isMounted) {
          setProfile(null);
        }
      }
    };

    const initializeAuth = async () => {
      try {
        if (abortController.signal.aborted) return;

        const { data: { session }, error } = await supabase.auth.getSession();

        if (!isMounted || abortController.signal.aborted) return;

        if (error) {
          console.warn('Session fetch error:', error);
          setLoading(false);
          setInitialized(true);
          return;
        }

        await handleAuthStateChange(session);
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
          setInitialized(true);
        }
      } catch (err) {
        console.warn('Auth initialization error:', err);
        if (isMounted) {
          setLoading(false);
          setInitialized(true);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (initialized) {
          await handleAuthStateChange(newSession);
        }
      }
    );

    return () => {
      isMounted = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, [initialized]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    },
    []
  );

  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'user',
        });
        if (profileError) throw profileError;
      }
    },
    []
  );

  const signOut = useCallback(
    async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    []
  );

  const updateProfile = useCallback(
    async (data: Partial<Profile>) => {
      if (!user) throw new Error('No user logged in');
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);
      if (error) throw error;
      const updatedProfile = await fetchProfile(user.id);
      setProfile(updatedProfile);
    },
    [user]
  );

  const contextValue = React.useMemo(
    () => ({
      user,
      session,
      profile,
      isLoading: loading,
      signIn,
      signOut,
      signUp,
      updateProfile,
    }),
    [user, session, profile, loading, signIn, signOut, signUp, updateProfile]
  );

  return (
    <AuthContext.Provider value={contextValue}>
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