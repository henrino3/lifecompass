'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase/client';
import { useCompassStore } from '@/lib/store';
import { getProfile } from '@/lib/supabase/database';
import { hasLocalDataToMigrate } from '@/lib/migration/localToCloud';
import { MigrationModal } from '@/components/modals/MigrationModal';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signInWithEmail: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showMigrationModal, setShowMigrationModal] = useState(false);

  const { setUser: setStoreUser, setIsGuest, loadFromCloud } = useCompassStore();

  useEffect(() => {
    const supabase = getSupabase();

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Load user profile and set in store
        const profile = await getProfile(session.user.id);
        if (profile) {
          setStoreUser(profile);
          setIsGuest(false);

          // Check if there's local data to migrate
          if (hasLocalDataToMigrate()) {
            setShowMigrationModal(true);
          } else {
            // Load reflections from cloud
            loadFromCloud();
          }
        }
      }

      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        const profile = await getProfile(session.user.id);
        if (profile) {
          setStoreUser(profile);
          setIsGuest(false);

          // Check for local data on sign in
          if (event === 'SIGNED_IN' && hasLocalDataToMigrate()) {
            setShowMigrationModal(true);
          } else if (event === 'SIGNED_IN') {
            loadFromCloud();
          }
        }
      } else {
        setStoreUser(null);
        setIsGuest(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [setStoreUser, setIsGuest, loadFromCloud]);

  const signInWithEmail = async (email: string) => {
    const supabase = getSupabase();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    return { error };
  };

  const signOut = async () => {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    // Explicitly clear local state
    setUser(null);
    setSession(null);
    setStoreUser(null);
    setIsGuest(true);
  };

  const handleMigrationComplete = () => {
    loadFromCloud();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        signInWithEmail,
        signOut,
      }}
    >
      {children}

      {/* Migration Modal - shown when user signs in with local data */}
      {user && (
        <MigrationModal
          isOpen={showMigrationModal}
          onClose={() => setShowMigrationModal(false)}
          userId={user.id}
          onMigrationComplete={handleMigrationComplete}
        />
      )}
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
