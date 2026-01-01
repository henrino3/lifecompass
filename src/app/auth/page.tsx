'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { StarField } from '@/components/effects/StarField';
import { useAuth } from '@/components/auth/AuthProvider';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signInWithEmail } = useAuth();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Check for error from callback
  const errorParam = searchParams.get('error');

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
            {/* Error message from callback */}
            {errorParam && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-xl text-sm bg-red-500/20 text-red-300"
              >
                {decodeURIComponent(errorParam)}
              </motion.div>
            )}

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
