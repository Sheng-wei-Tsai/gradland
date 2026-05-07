'use client';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import OnboardingModal from '@/components/OnboardingModal';

interface AuthContextType {
  user:                User | null;
  loading:             boolean;
  signInWithGithub:    () => Promise<void>;
  signInWithGoogle:    () => Promise<void>;
  signInWithFacebook:  () => Promise<void>;
  signInWithEmail:     (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail:     (opts: SignUpOpts) => Promise<{ error: string | null }>;
  signOut:             () => Promise<void>;
  reopenOnboarding:    () => void;
}

interface SignUpOpts {
  email:       string;
  password:    string;
  displayName: string;
  location:    string;
}

const AuthContext = createContext<AuthContextType>({
  user: null, loading: true,
  signInWithGithub:   async () => {},
  signInWithGoogle:   async () => {},
  signInWithFacebook: async () => {},
  signInWithEmail:    async () => ({ error: null }),
  signUpWithEmail:    async () => ({ error: null }),
  signOut:            async () => {},
  reopenOnboarding:   () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user,              setUser]              = useState<User | null>(null);
  const [loading,           setLoading]           = useState(true);
  const [showOnboarding,    setShowOnboarding]    = useState(false);
  // Once shown (or dismissed) in this session, don't auto-trigger again
  const onboardingShownRef = useRef(false);

  // Check if user needs onboarding after we have a session
  const checkOnboarding = useCallback(async (userId: string) => {
    if (onboardingShownRef.current) return;             // already shown this session
    if (localStorage.getItem('onboarding_dismissed') === '1') return;  // user permanently skipped
    const { data } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', userId)
      .maybeSingle();
    if (!data?.onboarding_completed) {
      onboardingShownRef.current = true;
      setShowOnboarding(true);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
      if (session?.user) checkOnboarding(session.user.id);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      // Fire onboarding check only on fresh sign-in
      if (event === 'SIGNED_IN' && session?.user) checkOnboarding(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [checkOnboarding]);

  const oauthRedirect = () => `${window.location.origin}/auth/callback`;

  const signInWithGithub = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'github',   options: { redirectTo: oauthRedirect() } });
  };
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google',   options: { redirectTo: oauthRedirect() } });
  };
  const signInWithFacebook = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'facebook', options: { redirectTo: oauthRedirect() } });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  };

  const signUpWithEmail = async ({ email, password, displayName, location }: SignUpOpts) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: displayName },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) return { error: error.message };

    if (data.user) {
      await supabase.from('profiles').upsert({
        id:           data.user.id,
        email,
        display_name: displayName,
        full_name:    displayName,
        location,
      });
    }

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const reopenOnboarding = useCallback(() => {
    localStorage.removeItem('onboarding_dismissed');    // allow it to show again
    onboardingShownRef.current = true;
    setShowOnboarding(true);
  }, []);

  const handleOnboardingComplete = useCallback(() => setShowOnboarding(false), []);

  return (
    <AuthContext.Provider value={{
      user, loading,
      signInWithGithub, signInWithGoogle, signInWithFacebook,
      signInWithEmail, signUpWithEmail, signOut,
      reopenOnboarding,
    }}>
      {children}
      {showOnboarding && <OnboardingModal onComplete={handleOnboardingComplete} />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
