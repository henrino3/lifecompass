'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Reflection, MODE_INFO, PERIOD_INFO } from '@/lib/types';

interface ReturningUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  latestReflection: Reflection;
  canUpgrade: boolean;
  onUpgrade: () => void;
  onRedo: () => void;
  onReview: () => void;
  onNewReflection: () => void;
  onDashboard: () => void;
}

export function ReturningUserModal({
  isOpen,
  onClose,
  latestReflection,
  canUpgrade,
  onUpgrade,
  onRedo,
  onReview,
  onNewReflection,
  onDashboard,
}: ReturningUserModalProps) {
  if (!isOpen) return null;

  const getModeIcon = () => {
    switch (latestReflection.mode) {
      case 'quick': return '⚡';
      case 'ok': return '✨';
      case 'deep': return '🌊';
    }
  };

  // Get word of year if set
  const wordOfYear = latestReflection.responses['word_of_year']?.value as string | undefined;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="bg-[var(--surface)] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Welcome back header */}
          <div className="text-center mb-6">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] flex items-center justify-center glow">
              <span className="text-4xl">👋</span>
            </div>
            <h3 className="font-display text-2xl mb-2">Welcome Back!</h3>
            <p className="text-[var(--text-muted)]">
              We found your previous reflection
            </p>
          </div>

          {/* Previous reflection summary */}
          <div className="mb-6 p-4 rounded-xl bg-[var(--bg)]">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{getModeIcon()}</span>
              <div>
                <div className="font-display">{MODE_INFO[latestReflection.mode].name} Mode</div>
                <div className="text-sm text-[var(--text-muted)]">
                  {latestReflection.year} {PERIOD_INFO[latestReflection.period].name}
                </div>
              </div>
            </div>

            {wordOfYear && (
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="text-sm text-[var(--text-muted)]">Your word of the year:</p>
                <p className="font-display text-xl text-[var(--accent)]">{wordOfYear}</p>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="space-y-3">
            {canUpgrade && (
              <button
                onClick={onUpgrade}
                className="w-full p-4 rounded-xl bg-[var(--accent)]/20 border border-[var(--accent)] text-left card-hover"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-display text-[var(--accent)]">Go Deeper</div>
                    <div className="text-sm text-[var(--text-muted)]">
                      Upgrade to a more comprehensive reflection
                    </div>
                  </div>
                  <span className="text-2xl">📈</span>
                </div>
              </button>
            )}

            <button
              onClick={onReview}
              className="w-full p-4 rounded-xl glass text-left card-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display">Review Answers</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Browse through your previous responses
                  </div>
                </div>
                <span className="text-2xl">📖</span>
              </div>
            </button>

            <button
              onClick={onRedo}
              className="w-full p-4 rounded-xl glass text-left card-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display">Start Fresh</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Begin a new reflection from scratch
                  </div>
                </div>
                <span className="text-2xl">🔄</span>
              </div>
            </button>

            <button
              onClick={onNewReflection}
              className="w-full p-4 rounded-xl glass text-left card-hover"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-display">New Period</div>
                  <div className="text-sm text-[var(--text-muted)]">
                    Start a Q1, Mid-Year, or different reflection
                  </div>
                </div>
                <span className="text-2xl">📅</span>
              </div>
            </button>
          </div>

          {/* View all */}
          <div className="mt-6 pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <button
              onClick={onDashboard}
              className="text-sm text-[var(--accent)] hover:underline"
            >
              View all reflections →
            </button>
            <button
              onClick={onClose}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text)]"
            >
              Close
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
