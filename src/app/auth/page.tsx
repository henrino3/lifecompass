'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { StarField } from '@/components/effects/StarField';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setMessage(null);

    const { error } = await signInWithEmail(email);

    if (error) {
      setMessage({ type: 'error', text: error.message });
    } else {
      setMessage({ type: 'success', text: 'Check your email for the login link!' });
    }

    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();
    if (error) {
      setMessage({ type: 'error', text: error.message });
      setIsLoading(false);
    }
    // Redirect happens automatically for OAuth
  };

  const handleContinueAsGuest = () => {
    router.push('/');
  };

  return (
    <main className="min-h-screen relative overflow-hidden">
      <StarField />

      <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center glow">
              <svg className="w-8 h-8 text-[var(--bg)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
              </svg>
            </div>
            <h1 className="font-display text-3xl font-bold mb-2">
              <span className="gradient-text">LifeCompass</span>
            </h1>
            <p className="text-[var(--text-muted)]">Sign in to sync your reflections</p>
          </div>

          {/* Sign in form */}
          <div className="glass rounded-2xl p-6 space-y-6">
            {/* Google OAuth */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="btn btn-secondary w-full flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[var(--border)]"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-[var(--surface)] text-[var(--text-muted)]">or</span>
              </div>
            </div>

            {/* Email Magic Link */}
            <form onSubmit={handleEmailSignIn} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input w-full"
                  disabled={isLoading}
                />
              </div>
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="btn btn-primary w-full"
              >
                {isLoading ? 'Sending...' : 'Send magic link'}
              </button>
            </form>

            {/* Message */}
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl text-sm ${
                  message.type === 'success'
                    ? 'bg-green-500/20 text-green-300'
                    : 'bg-red-500/20 text-red-300'
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </div>

          {/* Guest option */}
          <div className="mt-6 text-center">
            <button
              onClick={handleContinueAsGuest}
              className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors"
            >
              Continue as guest
            </button>
            <p className="text-xs text-[var(--text-muted)] mt-2">
              Guest data is saved locally and won&apos;t sync across devices
            </p>
          </div>
        </motion.div>
      </div>
    </main>
  );
}
