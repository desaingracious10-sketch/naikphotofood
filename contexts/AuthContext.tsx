import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { Profile, ProfileStatus } from '../types';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isActive: boolean;
  signIn: (email: string, password: string) => Promise<Profile>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const statusMessage = (status: ProfileStatus): string => {
  switch (status) {
    case 'pending':
      return 'Akun kamu sedang menunggu konfirmasi pembayaran.';
    case 'paid':
      return 'Pembayaran diterima! Akun sedang dalam proses aktivasi oleh admin (maks 1x24 jam).';
    case 'inactive':
      return 'Akun kamu tidak aktif. Hubungi admin via WhatsApp.';
    default:
      return 'Akun belum aktif.';
  }
};

const fetchProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('[Auth] fetchProfile error:', error);
    return null;
  }
  return (data as Profile) ?? null;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      return;
    }
    const p = await fetchProfile(user.id);
    setProfile(p);
  }, [user]);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!mounted) return;
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        if (mounted) setProfile(p);
      }
      if (mounted) setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        const p = await fetchProfile(currentUser.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string): Promise<Profile> => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw new Error(error.message === 'Invalid login credentials'
        ? 'Email atau password salah.'
        : error.message);
    }

    if (!data.user) {
      throw new Error('Gagal login: user tidak ditemukan.');
    }

    const p = await fetchProfile(data.user.id);
    if (!p) {
      await supabase.auth.signOut();
      throw new Error('Profile tidak ditemukan. Hubungi admin.');
    }

    if (p.status !== 'active') {
      await supabase.auth.signOut();
      throw new Error(statusMessage(p.status));
    }

    setUser(data.user);
    setProfile(p);
    return p;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
  };

  const value: AuthContextType = {
    user,
    profile,
    isLoading,
    isAuthenticated: !!user,
    isActive: profile?.status === 'active',
    signIn,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
